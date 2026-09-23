export const DEFAULT_API_BASE_URL = 'http://localhost:3000';

// The backend's Azure AD app registration's client ID, i.e. the resource the SPFx web part requests
// a delegated access token for. Must match the audience the backend's JWT middleware expects
// (AZURE_CLIENT_ID in its .env) -- the backend validates the bare client ID, not the "api://" App ID
// URI form, so requesting a token with the "api://" prefix produces a token whose `aud` claim the
// backend rejects. Left blank by default so the app still works unauthenticated in local/dev; set the
// "apiResourceId" web part property once the backend's auth middleware is actually enforced.
export const DEFAULT_API_RESOURCE_ID = 'a5d4c4d7-4fc2-4b85-996f-a38848a78525';
