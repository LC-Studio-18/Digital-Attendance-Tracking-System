# Attendance History API Contract

Endpoint: `GET /api/v1/attendance/history`

This document describes the **actual** behaviour of the implemented endpoint in
`src/routes/attendanceRoutes.js`, `src/middleware/authMiddleware.js`,
`src/controllers/attendanceController.js`, `src/services/googleSheetsService.js`
and `src/utils/attendanceResponse.js`.

## Authentication

The endpoint is protected by `verifyToken`. Requests must include a Firebase
ID token in the `Authorization` header:

```http
Authorization: Bearer <Firebase ID token>
```

- The token is verified server-side with Firebase Admin `auth.verifyIdToken()`.
- The verified token supplies `uid` and `email`. The user role is read from the
  `role` custom claim. **If the claim is absent, the role defaults to `staff`.**
- `admin`: may read attendance records for the whole organisation.
- `staff`: may read only records whose Firebase UID matches the verified
  token's `uid`. The UID is read from the record key `uid`, then `user_id`, then
  `user id (firebase uid)` (first present value wins).
- Any other verified role (for example `manager`) receives HTTP 403.
- Tokens in query strings, cookies or other headers are not accepted.

## Query parameters

Both parameters are parsed with `parseInt(value, 10)` and clamped to a minimum
of `1`. There is no upper limit in the current implementation.

| Parameter | Default | Behaviour |
|---|---|---|
| `page` | `1` | Page number, 1-based. Values below `1` become `1`. A non-numeric value uses the default. |
| `limit` | `50` | Number of records per page. Values below `1` become `1`. A non-numeric value uses the default. |

Records are sorted by `date` descending (newest first) **before** pagination is
applied. Sorting uses a string comparison
(`String(record.date ?? '').localeCompare(...)`), not `Date` parsing, because
the Google Sheets service returns cell values as strings. ISO-style dates such
as `YYYY-MM-DD` therefore sort correctly in descending order; other formats are
compared lexicographically and may not sort chronologically. Missing or empty
dates sort last.

Examples:

- `/api/v1/attendance/history`
- `/api/v1/attendance/history?page=2&limit=25`

## Successful response (HTTP 200)

```json
{
  "success": true,
  "count": 2,
  "totalRecords": 2,
  "currentPage": 1,
  "totalPages": 1,
  "data": []
}
```

| Field | Type | Meaning |
|---|---|---|
| `success` | boolean | Always `true` for a successful response. |
| `count` | number | Number of records in `data` on the current page (not the total). |
| `totalRecords` | number | Number of matching records **after role filtering**, before pagination. |
| `currentPage` | number | Effective page number after parsing/clamping. |
| `totalPages` | number | `0` when `totalRecords` is `0`; otherwise `Math.ceil(totalRecords / limit)`. |
| `data` | array | The records for the current page, newest first. |

### Record shape inside `data`

Records come directly from the Google Sheets service. Each object has:

- `id`: a number generated from the row position, starting at `1` for the first
  data row (header row is excluded).
- One key per spreadsheet header. Header text is trimmed and lower-cased; cell
  values are strings, or `""` for empty cells.

The field names below are an example based on typical sheet headers; the exact
keys depend on the spreadsheet's header row. The API does not rename or add
other fields to each record.

### Example with records

```json
{
  "success": true,
  "count": 2,
  "totalRecords": 2,
  "currentPage": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "uid": "firebase-uid-example",
      "date": "2026-11-18",
      "status": "Present",
      "check in": "08:02"
    },
    {
      "id": 2,
      "uid": "firebase-uid-example",
      "date": "2026-11-17",
      "status": "Absent",
      "check in": ""
    }
  ]
}
```

### Empty result

A staff user with no matching records (or an empty spreadsheet) still receives
HTTP 200 with an empty `data` array:

```json
{
  "success": true,
  "count": 0,
  "totalRecords": 0,
  "currentPage": 1,
  "totalPages": 0,
  "data": []
}
```

## Error responses

### HTTP 401 — missing or malformed Bearer token

Returned by the auth middleware when the `Authorization` header is absent or
does not start with `Bearer `.

```json
{
  "success": false,
  "message": "Unauthorized: Missing or malformed Bearer token"
}
```

### HTTP 401 — invalid or expired token

Returned when Firebase Admin rejects the supplied ID token.

```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

### HTTP 403 — invalid role

Returned when the token is valid but its `role` claim is neither `admin` nor
`staff`.

```json
{
  "success": false,
  "message": "Forbidden: Invalid role"
}
```

### HTTP 500 — server/upstream failure

Errors thrown by the controller (for example a missing `SPREADSHEET_ID` or a
Google Sheets API failure) are passed to the Express error handler. Note that
this error shape is intentionally different from the 401/403 responses:

```json
{
  "status": "error",
  "message": "Missing SPREADSHEET_ID in environment variables"
}
```

## Frontend integration notes

- Treat `data` as the only source of rows for the table; `count` describes that
  page only. Use `totalRecords` and `totalPages` for pagination controls.
- A staff response can legitimately be empty with HTTP 200; this is not an error.
- Do not rely on a fixed set of record keys: they are derived from sheet headers.
- Send the Firebase ID token on every request; the API does not use sessions.
