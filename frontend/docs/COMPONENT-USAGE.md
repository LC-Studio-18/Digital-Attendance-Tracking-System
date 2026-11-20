# S1-16 component usage

Import the shared components from `src/components`:

```jsx
import {
  ErrorMessage,
  ExportCsvControl,
  Loader,
  SuccessMessage,
} from './components';
```

## Loader

`<Loader />` announces “Loading…” by default. Always provide a task-specific label for a real request. Supported sizes are `sm`, `md` (default), and `lg`; set `inline` for a button or compact row.

```jsx
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? <Loader label="Signing in…" size="sm" inline /> : 'Sign in'}
</button>
```

Keep the button disabled for the full request so repeated submissions are blocked. Use the same pattern for clock actions; use a labelled block loader while loading dashboard data.

## ErrorMessage

Pass a known HTTP status or stable application code using `code`. The component maps it to approved, user-safe wording. You can supply a screen-specific `message`, optional `title`, `onRetry`, `retryLabel`, `onDismiss`, `dismissible`, `className`, and supplemental `children`.

```jsx
<ErrorMessage code={500} onRetry={reloadAttendance} />
<ErrorMessage code="invalid-credentials" />
```

Supported mappings include 401 (session expired), 403 (access denied), 409 (duplicate clock-in), 500/502/503/504 (generic server error), `invalid-credentials`, `duplicate-clock-in`, `duplicate-clock-out`, `offline`, and `network`. Unknown values use generic safe copy; they are never echoed. Handle a 401 redirect in the calling screen or authentication layer. Do not pass raw exception messages, response bodies, stack traces, or secrets to the component.

Retry is an explicit user action, not an automatic retry. Add it to recoverable data-load errors, and make its callback perform the request again.

## SuccessMessage

Render success only after the server confirms the action. `message` defaults to “Success!”. Optional props are `title`, `onDismiss`, `dismissible`, `autoHideMs`, `className`, and `children`. Auto-hide is off by default; use it only when a disappearing confirmation is appropriate.

```jsx
{
  saved && <SuccessMessage message="Your clock-in was recorded." />;
}
```

## ExportCsvControl

Drop into the Admin Dashboard. It renders the start/end date filters next to an **Export CSV** button, disables both while exporting, and shows an inline `Loader` inside the button. Styling follows the `L.C Admin/dashboard.html` design (dark `#0f172a` button, 6px radius, compact gray-bordered date inputs).

By default it calls `GET /api/reports/export` with the selected `startDate` and `endDate`, downloads the returned Blob using a temporary anchor, and shows a success toast or a safe error message. See [REPORTS-EXPORT-API.md](./REPORTS-EXPORT-API.md) for the full request/response contract and implementation notes.

```jsx
// Inside the Admin Dashboard (backend-driven export):
<ExportCsvControl token={firebaseToken} />
```

Override `filename`, `label`, `loadingLabel` or `minLoadingMs` as before. Pass `onExport(filteredRecords, range)` to replace the API call, or `local` to build the CSV in the browser from `records`/`columns` (the original behaviour). Reversed ranges show an inline error; API failures use `ErrorMessage` and success uses `SuccessMessage` — raw errors are never shown. Shared download/CSV helpers live in `src/utils/csv.js`.

## Error copy reference

| Code                       | User-facing message                                                |
| -------------------------- | ------------------------------------------------------------------ |
| `invalid-credentials`      | Email or password is incorrect.                                    |
| 401                        | Your session has expired. Please sign in again.                    |
| 403                        | You don't have access to this page.                                |
| 409 / `duplicate-clock-in` | You're already clocked in.                                         |
| `duplicate-clock-out`      | You're already clocked out.                                        |
| 500, 502, 503, 504         | Something went wrong. Please try again.                            |
| `offline`                  | You're offline. Check your connection and try again.               |
| `network`                  | We couldn't reach the server. Check your connection and try again. |

Update the shared map in `src/utils/errorMessages.js` if the backend introduces a stable error code. Keep technical detail in protected developer logs, not user-facing feedback.

## Verification

Run `npm test` for the existing component and message-mapping tests, `npm run lint` for ESLint, and `npm run build` to create the distributable preview.
