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
import { ApiError, IApiErrorInfo } from '../models/IApiError';
import { DEFAULT_API_BASE_URL } from './Constants';

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

// `configureApiClient` can change this after the module has already loaded (e.g. once the web part
// reads its property-pane setting), so every request must read the current value, not a fixed one.
let apiRoot: Queryable = createApiRoot(DEFAULT_API_BASE_URL);

export function configureApiClient(baseUrl: string): void {
  apiRoot = createApiRoot(baseUrl || DEFAULT_API_BASE_URL);
}

async function sendRequest<T>(path: string, operation: typeof get, init?: RequestInit): Promise<T> {
  try {
    return await op<T>(new Queryable(apiRoot, path), operation, init);
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

export const apiClient = {
  get: <T>(path: string): Promise<T> => sendRequest<T>(path, get),
  post: <T>(path: string, payload?: unknown): Promise<T> => sendRequest<T>(path, post, body(payload || {})),
  put: <T>(path: string, payload?: unknown): Promise<T> => sendRequest<T>(path, put, body(payload || {})),
  delete: <T>(path: string, payload?: unknown): Promise<T> =>
    sendRequest<T>(path, del, payload !== undefined ? body(payload) : undefined)
};
