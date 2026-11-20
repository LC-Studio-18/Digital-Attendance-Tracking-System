# Attendance History API Contract

Endpoint: `GET /api/attendance`

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
- `admin`: may read attendance records for the whole organisation and may use
  `employeeId` to filter across employees.
- `staff`: may read only their own records. The Google Sheets service resolves
  the verified `uid`/`email` through the `Employees` tab to an employee ID, then
  returns attendance rows with a matching `employeeId` (or legacy `uid`,
  `user_id`, `user id (firebase uid)`) value. Any `employeeId` supplied by the
  client is ignored; date filters still apply to their own records only.
- Any other verified role (for example `manager`) receives HTTP 403.
- Tokens in query strings, cookies or other headers are not accepted.

## Query parameters

| Parameter | Default | Behaviour |
|---|---|---|
| `date` | none | Return records for one calendar date, for example `2026-11-18`. |
| `startDate` | none | Inclusive start of a date range. May be used on its own. |
| `endDate` | none | Inclusive end of a date range. May be used on its own. |
| `employeeId` | none | Admin only. Employee Firebase UID to filter by. Ignored for `staff` requests (their authenticated UID is always used). |
| `page` | `1` | Page number, 1-based. Only positive integer strings are accepted; malformed, zero, negative or non-string values use the default. A page beyond the last page returns an empty `data` array. |
| `limit` | `20` | Records per page. Only positive integer strings are accepted; malformed, zero, negative or non-string values use the default. Values above `100` are capped at `100`. |

Blank values (`?date=`, `?employeeId=`, etc.) are treated as if the parameter
was not supplied. `date` cannot be combined with `startDate` or `endDate`; use
one date selection method at a time. `employeeId` can be combined with either
method.

Filtering is applied **after** role-based access control and **before** sorting
and pagination, so `totalRecords`, `count` and `totalPages` describe the
matching records only.

### Accepted date formats

Query dates must use the ISO calendar format `YYYY-MM-DD`
(`YYYY-M-D` is also accepted and normalised). Calendar validity is checked, so
`2026-02-30` and `2026-13-01` are rejected.

Spreadsheet `date` cells are strings, not JavaScript `Date` objects. Values such
as `2026-11-18`, `2026/11/18` and `2026-11-18T08:15:00.000Z` are normalised to
`YYYY-MM-DD` for comparison; a time portion is ignored. Records with a missing
or unrecognised date never match a date filter, but are returned when no date
filter is supplied.

### Accepted employee identifiers

`employeeId` must be a single non-blank string of at most 128 characters
containing letters, digits or `.`, `_`, `:`, `@` and `-` (and must start with a
letter or digit). It is matched against the record's `employeeId`, `employeeID`,
`uid`, `user_id`, `user id (firebase uid)`, `employeeid`, `employee_id` or
`employee id` column.

### Examples

- `/api/attendance` — no filters, all permitted records.
- `/api/attendance?date=2026-11-18` — one date.
- `/api/attendance?startDate=2026-11-01&endDate=2026-11-30` — inclusive range.
- `/api/attendance?employeeId=staff-uid-1` — one employee (admin).
- `/api/attendance?employeeId=staff-uid-1&date=2026-11-18` — combined.
- `/api/attendance?employeeId=staff-uid-1&startDate=2026-11-01&endDate=2026-11-30&page=2&limit=25` — combined filters with pagination.

Records are sorted newest first **before** pagination is applied. Sorting uses
the normalized `timestamp` value when present, otherwise the `date` value; both
`Date` objects and parseable date strings are supported. Missing or unparseable
timestamps and dates sort last.

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
| `totalRecords` | number | Number of matching records **after role and filter parameters are applied**, before pagination. |
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

A user with no matching records (for example an unmatched filter, a staff user
with no records, or an empty spreadsheet) still receives HTTP 200 with an empty
`data` array:

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

### HTTP 400 — invalid filters

Filter validation failures use the same response shape as the 401/403 errors,
with a `message` describing the problem:

```json
{
  "success": false,
  "message": "Bad Request: Invalid date. Use YYYY-MM-DD."
}
```

Possible messages:

| Condition | Message |
|---|---|
| Malformed or impossible `date`, `startDate` or `endDate` | `Bad Request: Invalid <parameter>. Use YYYY-MM-DD.` |
| Repeated or non-string date/employee parameter | Corresponding `Invalid ...` message above |
| `startDate` after `endDate` | `Bad Request: Invalid date range. startDate must be on or before endDate.` |
| `date` combined with `startDate`/`endDate` | `Bad Request: Use either date or startDate/endDate, not both.` |
| Malformed, repeated or too-long `employeeId` | `Bad Request: Invalid employeeId.` |

Filter validation runs after authentication and role checks, so missing tokens
still receive 401 and unsupported roles still receive 403.

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
