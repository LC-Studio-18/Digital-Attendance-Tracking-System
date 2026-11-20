# Reports export API wiring (S1-22a)

Branch: `frontend6-feature-s1-22a-api's`  
Date: 2026-11-20  
Scope: frontend only

## 1. What we did

The **Export CSV** button used to build a CSV file entirely in the browser from
the `records` prop. It now calls the backend report endpoint by default:

```
GET /api/reports/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

The selected date range is sent as query parameters, the returned file is
saved through a browser download, and the user gets a success toast or a safe
error message depending on the API result.

The old client-side behaviour was not deleted: it is still available through
two explicit escape hatches, so existing demos/tests keep working.

## 2. Files changed

| File | Purpose |
| --- | --- |
| `src/services/reportsApi.js` | New API client for `GET /api/reports/export`; parses filename/message, maps errors |
| `src/services/reportsApi.test.js` | Tests for params, blob response, filename parsing and error mapping |
| `src/components/ExportCsvControl.jsx` | Calls the API, downloads the blob, renders success/error toast |
| `src/components/ExportCsvControl.test.jsx` | Tests for API call, download, success toast and error toast |
| `src/utils/csv.js` | Added reusable `downloadBlob()` anchor helper; `downloadCsv()` now uses it |
| `src/styles/export-csv.css` | Toast wrapper styling; shared status-message styles now apply |
| `docs/COMPONENT-USAGE.md` | Updated `ExportCsvControl` usage notes |
| `docs/REPORTS-EXPORT-API.md` | This record of what was done and how |

## 3. API contract used by the frontend

### Request

- **Method:** `GET`
- **Path:** `/api/reports/export` (appended to `VITE_API_URL`, default
  `http://localhost:5000` — the same base URL as the attendance history API)
- **Query parameters:**
  - `startDate` — `YYYY-MM-DD`, omitted when empty
  - `endDate` — `YYYY-MM-DD`, omitted when empty
- **Headers:**
  - `Accept` is handled by axios
  - `Authorization: Bearer <token>` is sent only when a `token` prop is passed
- **axios options:** `responseType: 'blob'` so the response is not parsed as
  text/JSON, and an optional `signal` for cancellation.

Example:

```js
exportAttendanceReport({
  startDate: '2026-11-01',
  endDate: '2026-11-19',
  token,
});
```

### Response

The successful response is expected to be a file Blob. The service returns:

```js
{
  blob,       // the file returned by the API
  filename,   // from Content-Disposition, else 'attendance-report.csv'
  message,    // from X-Message / JSON `message`, else ''
}
```

`filenameFromContentDisposition()` understands both
`filename="report.csv"` and `filename*=UTF-8''report%20Nov.csv`.

If the API returns `application/json` with `success: false` or an `error`
field (even with a 200 status), the service throws
`{ code: 'export_failed', message: <api message> }` instead of downloading the
JSON body.

### Error mapping

Transport/HTTP failures are converted to the same safe codes used elsewhere:

| Situation | Thrown value |
| --- | --- |
| `ERR_CANCELED` / `CanceledError` | `{ code: 'cancelled' }` |
| `ERR_NETWORK` or no response | `{ code: 'network' }` or `{ code: 'offline' }` |
| HTTP 401 / 403 / 404 / 500 / 502 / 503 / 504 | `{ code: <status> }` |
| Other HTTP statuses | `{ code: 500 }` |
| API JSON error body | `{ code: 'export_failed', message }` |

Raw exception text is never shown unless it is an explicit API message on an
`export_failed` response.

## 4. How the button now works

1. The user picks `Start date` / `End date`.
2. `handleSubmit()` rejects a reversed range with the existing inline error and
   makes no request.
3. The button is disabled and shows the existing inline `Loader` while the
   request runs (`minLoadingMs` keeps the spinner visible for very fast APIs).
4. `exportAttendanceReport()` calls the endpoint with the selected range.
5. `downloadBlob()` creates a temporary `<a download>` pointing at an object
   URL for the returned Blob, clicks it programmatically and removes it. The
   object URL is revoked on the next tick.
6. Feedback is rendered with the shared components:
   - success → `SuccessMessage` (`role="status"`, auto-hides after 5s)
   - failure → `ErrorMessage` (`role="alert"`, dismissible)
7. The API's `message` is used as the success text when supplied; otherwise the
   toast says `Report downloaded successfully.` For `export_failed` errors the
   API message is shown; other failures use
   `We could not export the CSV. Please try again.`

No new download dependency was added — the anchor/object-URL trick is the
library-equivalent approach and works in all supported browsers.

## 5. Backward compatibility

`ExportCsvControl` keeps its old props and adds two/three new ones:

| Prop | Behaviour |
| --- | --- |
| `onExport(filteredRecords, range)` | Still called instead of the API (legacy integration/tests) |
| `local` | Builds the CSV in the browser with `buildCsv()` + `downloadCsv()` |
| `token` | Optional Firebase token forwarded as `Authorization: Bearer …` |

Default (`onExport` and `local` both unset) is the API path described above.
`records` and `columns` are only used by the two local paths.

## 6. Tests and verification

Added tests:

- `reportsApi.test.js`
  - sends `startDate`/`endDate` as params with `responseType: 'blob'`
  - attaches the bearer token when supplied
  - omits empty params and uses the fallback filename
  - parses both plain and UTF-8 `Content-Disposition` filenames
  - maps network failures to safe codes
  - surfaces an API-level JSON failure message
- `ExportCsvControl.test.jsx`
  - calls the API with the selected range and downloads the returned blob
    under the API filename
  - shows a success toast with the API message (`role="status"`)
  - shows a safe error toast (`role="alert"`) when the API rejects
  - shows the API error message for `export_failed`
  - keeps the original local/`onExport` behaviour tests

Commands run:

```bash
npm test -- --run   # 11 files, 68 tests passed
npm run lint        # clean
npm run build       # production build succeeded
```

## 7. Design decisions / trade-offs

- **Anchor trick instead of `file-saver`:** avoids adding a dependency for a
  few lines of well-understood DOM code; `downloadBlob()` is shared with the
  existing CSV helper.
- **`responseType: 'blob'`:** keeps binary/CSV data intact and lets us read
  `Content-Disposition` from the response headers.
- **Safe error copy:** API messages are only trusted for explicit
  `export_failed` JSON responses; axios/network errors map to the existing
  error-code vocabulary.
- **Optional token:** the component does not fetch auth state itself; the
  caller decides whether to pass `token`, keeping the component reusable.
- **Local mode retained:** useful for offline previews and for the existing
  component tests, while the production default is now backend-driven.

## 8. Manual verification / next steps

1. Start the backend with `GET /api/reports/export` implemented and ensure
   `VITE_API_URL` points at it (also check CORS for `Content-Disposition`
   exposure if the header is needed for the filename).
2. Render `<ExportCsvControl />` on the Admin Dashboard.
3. Choose a range, click **Export CSV**, confirm a file downloads with the
   API-provided name and a success toast appears.
4. Force an API error (e.g. stop the server) and confirm the safe error toast.
5. If the endpoint requires authentication, pass the current Firebase token:
   `<ExportCsvControl token={token} />`.
