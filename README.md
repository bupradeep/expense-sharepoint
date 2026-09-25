# Expense Reimbursement (SPFx Web Part)

A SharePoint Framework web part for filing, approving, and reimbursing employee expense claims.
It's the SharePoint front end for a standalone REST API (see `../backend`) — the web part itself
holds no business data; it's a thin client over that API, authenticated with Azure AD bearer tokens.

## Features

**Employee**
- Create, edit, and submit expense claims with multiple line items and receipts.
- Attach/view/remove receipts per item (stored in a SharePoint document library via Microsoft Graph,
  not in this web part's own storage).
- Track claim status and comment on a claim through its approval history.

**Manager / Department Head**
- Review and approve, reject, or send back claims pending their stage.
- File their own claims as well (Finance is review-only and never files claims).

**Finance**
- Approve/reject/send back claims at the Finance review stage.
- Approval history (with filters), Reports (with filters), and a view-only Reimbursement tab.

**Admin**
- Dashboard, full claims list with filters (including claim number search), approval rules,
  approval history, departments/projects/users/expense categories, reimbursement processing,
  reports with CSV export, and an audit log.

## How approvals are routed

Approval rules (`Admin > Approval Rules`) are amount-banded and level-based:

- A **Level 1** rule decides the *starting* stage for a claim of that amount — e.g. a rule for
  ₹0–10,000 with role `Finance` sends small claims straight to Finance, skipping Manager entirely.
  If no Level 1 rule matches an amount, **Manager** is the default starting stage.
- **Level 2 / Level 3** rules decide whether the chain continues after the stage before them
  approves (e.g. a Level 2 rule can route straight to Finance and skip Department Head). If no
  rule matches, the claim is fully approved at that point.

This logic lives in the backend (`services/approvalService.js`), not in this repo.

## Authorization

Role checks are enforced **server-side**, not just by which tabs the SPFx UI shows — hiding an
admin screen from a non-admin user is a UX convenience here, not the actual access control.
The backend gates every route with `middleware/requireRole.js`, plus object-level checks (claim
ownership, `Draft`/`Sent Back`-only edits, etc.) in the service layer:

| Area | Who can act |
|---|---|
| File / edit / delete a claim | Employee, Manager, Department Head — own claims only, and only editable while `Draft`/`Sent Back` |
| Approve / reject / send back a claim | Manager, Department Head, or Finance — the specific role required depends on the claim's current stage |
| Process reimbursement ("Mark as Paid") | Finance |
| Reports, and the user directory (used to populate filter dropdowns) | Admin, Finance |
| Departments, Projects, Users, Expense Categories, Approval Rules, Policy Rules, Audit Log | Admin |

Admin can act on anything (the same "Admin bypass" convention used throughout the service layer).
A blocked call returns `403` with a `{ "message": "..." }` body explaining which role is required.

## Architecture

```
SharePoint page
  └─ Expense web part (this repo, React + Fluent UI)
       └─ REST API calls, bearer-token authenticated ──▶ Expense backend (../backend, Node/Express)
                                                              ├─ SQL Server (via Sequelize)
                                                              ├─ Microsoft Graph (app-only) ──▶ SharePoint
                                                              │    document library (receipt files)
                                                              └─ Email notifications (nodemailer)
```

- The web part acquires a delegated Azure AD token via SPFx's built-in `aadTokenProviderFactory`
  and sends it as `Authorization: Bearer ...` on every API call (`src/utils/ApiClient.ts`).
- Receipt upload/download go through the same backend API as everything else — the backend uploads
  to/streams from a SharePoint drive on its own (app-only) credentials, so no SharePoint context or
  delegated file permissions are needed on the client side.

## Web part properties

Configurable from the property pane (or in `config/serve.json` / `preconfiguredEntries` for local dev):

| Property | Description | Default |
|---|---|---|
| `apiBaseUrl` | Base URL of the Expense backend API | `http://localhost:3000` |
| `apiResourceId` | Azure AD app (client) ID of the backend's app registration — the resource the web part requests a delegated token for. Leave blank to run against an unauthenticated/local backend. | *(blank)* |
| `defaultPageSize` | Default rows-per-page for paginated lists | `5` |

## Prerequisites

- Node.js `>=22.14.0 <23.0.0`
- The [Expense backend API](../backend) running and reachable, with its own `.env` configured
  (SQL Server connection, `AZURE_TENANT_ID` / `AZURE_CLIENT_ID` / `AZURE_CLIENT_SECRET`,
  `SHAREPOINT_SITE_ID`, mail provider) — see `../backend/.env.example` for the full list.
- An Azure AD app registration for the backend, with:
  - A delegated scope exposed under "Expose an API" (this solution requests `access_as_user`
    against it by default — see `config/package-solution.json`'s `webApiPermissionRequests`).
  - The application permission (`Sites.Selected` or `Sites.ReadWrite.All`/`Files.ReadWrite.All`)
    for the Graph client that uploads receipts, admin-consented. If using `Sites.Selected`, the
    app additionally needs an explicit site-level grant via `POST /sites/{siteId}/permissions` —
    granting the API permission in the Azure Portal alone is not sufficient for that permission type.

## Getting started

```bash
npm install
npm run start      # heft start --clean -- serves the workbench at https://localhost:4321
```

Open `https://<your-tenant>.sharepoint.com/_layouts/15/workbench.aspx` (or the local
`https://localhost:4321/temp/workbench.html`) and add the "expense" web part.

## Building and deploying

```bash
npm run build       # heft test --clean --production && heft package-solution --production
```

This produces `sharepoint/solution/expense.sppkg`. Upload it to your tenant's App Catalog
(replacing any previous version) to deploy. After the **first** deployment, a SharePoint/tenant
admin must approve the pending API access request once, under
**SharePoint Admin Center → Advanced → API access** — otherwise token acquisition will fail for
every user.

## Project structure

```
src/
  models/            TypeScript interfaces mirroring the backend's API shapes
  services/           One file per API resource (expenseService, approvalService, ...)
  utils/               ApiClient (auth + fetch), Formatters, StatusBadge, csvExport, Constants
  webparts/expense/
    ExpenseWebPart.ts  Web part entry point / property pane
    components/
      admin/           Admin console (dashboard, claims, master data, reports, audit log, ...)
      employee/         My Expenses, claim form/detail, item editor, receipts
      approvals/        My Approvals, approval claim detail
      common/           Shared UI: TableCard, FormRow, pagination, BackButton, ActiveToggle, ...
```

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**
