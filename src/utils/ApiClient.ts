// Thin PnPjs-based HTTP client for the Expense backend (a plain REST API, not SharePoint/Graph).
// PnPjs calls this base building block a "Queryable": you create one for a URL, attach behaviors
// to it (how to fetch, how to parse the response, etc.), then invoke it with get/post/put/del.
import {
  Queryable,
  get,
  post,
  put,
  del,
  op,
  body,
  BrowserFetchWithRetry,
  DefaultParse,
  InjectHeaders,
  ResolveOnData,
  RejectOnError
} from '@pnp/queryable';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ApiError, IApiErrorInfo } from '../models/IApiError';
import { DEFAULT_API_BASE_URL, DEFAULT_API_RESOURCE_ID } from './Constants';

// Builds a Queryable pointed at the backend's base URL, with everything it needs to actually work:
// - BrowserFetchWithRetry: perform the request via fetch()
// - DefaultParse: parse the JSON response (and throw on non-2xx)
// - InjectHeaders: send/accept JSON
// - ResolveOnData / RejectOnError: without these, calls never resolve or reject
function createApiRoot(baseUrl: string): Queryable {
  return new Queryable(baseUrl).using(
    BrowserFetchWithRetry(),
    DefaultParse(),
    InjectHeaders({ Accept: 'application/json', 'Content-Type': 'application/json' }),
    ResolveOnData(),
    RejectOnError()
  );
}

// `configureApiClient` can change these after the module has already loaded (e.g. once the web part
// reads its property-pane settings), so every request must read the current values, not fixed ones.
let apiRoot: Queryable = createApiRoot(DEFAULT_API_BASE_URL);
let currentBaseUrl: string = DEFAULT_API_BASE_URL;
let aadContext: WebPartContext | undefined;
let apiResourceId: string = DEFAULT_API_RESOURCE_ID;

export function configureApiClient(baseUrl: string, context?: WebPartContext, resourceId?: string): void {
  currentBaseUrl = baseUrl || DEFAULT_API_BASE_URL;
  apiRoot = createApiRoot(currentBaseUrl);
  aadContext = context;
  apiResourceId = resourceId || DEFAULT_API_RESOURCE_ID;
}

// The backend now validates an Entra ID (Azure AD) bearer token on incoming requests. SPFx acquires
// this for the signed-in user via the platform's own AAD token broker -- no client secret is ever
// needed (or safe to hold) in this browser-side code; that's only used by the backend to verify the
// token's signature against Azure AD's public keys. Returns undefined (and the request goes out
// without an Authorization header) until the web part's "apiResourceId" property is configured, so
// this stays backward compatible with an unauthenticated/local backend.
async function getBearerToken(): Promise<string | undefined> {
  if (!aadContext || !apiResourceId) {
    return undefined;
  }

  const tokenProvider = await aadContext.aadTokenProviderFactory.getTokenProvider();
  return tokenProvider.getToken(apiResourceId);
}

async function sendRequest<T>(path: string, operation: typeof get, init?: RequestInit): Promise<T> {
  try {
    const token = await getBearerToken();
    const request = new Queryable(apiRoot, path);

    if (token) {
      request.using(InjectHeaders({ Authorization: `Bearer ${token}` }));
    }

    return await op<T>(request, operation, init);
  } catch (err) {
    throw new ApiError(await toApiErrorInfo(err));
  }
}

// PnPjs wraps a failed request in its own error whose `.message` is a generic wrapper string, not
// the backend's actual `{ message: "..." }` body. Re-read the response to recover that real message.
async function toApiErrorInfo(err: unknown): Promise<IApiErrorInfo> {
  const httpError = err as { isHttpRequestError?: boolean; status?: number; statusText?: string; response?: Response };

  if (!httpError?.isHttpRequestError) {
    return { status: 0, message: err instanceof Error ? err.message : 'Unknown error' };
  }

  let message = httpError.statusText || 'Request failed';
  try {
    const backendBody = await httpError.response?.clone().json();
    if (typeof backendBody?.message === 'string') {
      message = backendBody.message;
    }
  } catch {
    // backend didn't return a JSON body -- fall back to statusText above
  }

  return { status: httpError.status ?? 0, message };
}

// PnPjs' Queryable always JSON-stringifies its body and forces a "Content-Type: application/json"
// header (see createApiRoot above), which breaks a multipart file upload (the browser needs to set
// its own "multipart/form-data; boundary=..." header) and a binary file download (DefaultParse only
// knows how to parse JSON). Both go through a plain fetch() instead, reusing the same bearer token.
async function toFetchErrorInfo(response: Response): Promise<IApiErrorInfo> {
  let message = response.statusText || 'Request failed';
  try {
    const backendBody = await response.clone().json();
    if (typeof backendBody?.message === 'string') {
      message = backendBody.message;
    }
  } catch {
    // backend didn't return a JSON body -- fall back to statusText above
  }

  return { status: response.status, message };
}

async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = await getBearerToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${currentBaseUrl}/${path}`, { method: 'POST', headers, body: formData });

  if (!response.ok) {
    throw new ApiError(await toFetchErrorInfo(response));
  }

  return response.json();
}

async function downloadBlob(path: string): Promise<Blob> {
  const token = await getBearerToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${currentBaseUrl}/${path}`, { headers });

  if (!response.ok) {
    throw new ApiError(await toFetchErrorInfo(response));
  }

  return response.blob();
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => sendRequest<T>(path, get),
  post: <T>(path: string, payload?: unknown): Promise<T> => sendRequest<T>(path, post, body(payload || {})),
  put: <T>(path: string, payload?: unknown): Promise<T> => sendRequest<T>(path, put, body(payload || {})),
  delete: <T>(path: string, payload?: unknown): Promise<T> =>
    sendRequest<T>(path, del, payload !== undefined ? body(payload) : undefined),
  upload: <T>(path: string, formData: FormData): Promise<T> => uploadFormData<T>(path, formData),
  downloadBlob: (path: string): Promise<Blob> => downloadBlob(path)
};
