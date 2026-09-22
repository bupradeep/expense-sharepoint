export const DEFAULT_API_BASE_URL = 'http://localhost:3000';
export const RECEIPTS_LIBRARY_NAME = 'ExpenseReceipts';

// The backend's Azure AD app registration's Application ID URI (e.g. "api://<client-id>"), i.e. the
// resource the SPFx web part requests a delegated access token for. Must match the audience the
// backend's JWT middleware expects (AZURE_CLIENT_ID in its .env). Left blank by default so the app
// still works unauthenticated in local/dev; set the "apiResourceId" web part property once the
// backend's auth middleware is actually enforced.
export const DEFAULT_API_RESOURCE_ID = 'api://a5d4c4d7-4fc2-4b85-996f-a38848a78525';
