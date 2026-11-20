# Attendance History API

## Endpoint

`GET /api/v1/attendance/history`

The route is mounted by `src/app.js` and registered in `src/routes/attendance.js`.

## Authentication and access

Send a Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <Firebase ID token>
```

`verifyToken` validates the token with Firebase Admin. The authenticated
identity contains `uid`, `email`, and `role`; a missing role claim defaults to
`staff`.

- `admin` can read all retrieved records and use `employeeId` to filter them.
- `staff` can read only records whose `uid`, `user_id`, or
  `user id (firebase uid)` field matches the authenticated Firebase UID. A
  valid `employeeId` query is ignored for staff. It is still validated, so an
  invalid value returns HTTP 400.
- Other roles receive HTTP 403.

The current `sheets.js` service returns the configured attendance range. The
controller maps those rows and scopes staff access by the Firebase UID fields
listed above; it does not perform an employee-directory lookup.

## Query parameters

| Parameter | Default | Behavior |
|---|---:|---|
| `date` | none | Match one calendar date. |
| `startDate` | none | Inclusive start of a date range; may be used alone. |
| `endDate` | none | Inclusive end of a date range; may be used alone. |
| `employeeId` | none | Admin-only record filter; ignored for staff after validation. |
| `page` | `1` | Positive integer page number; invalid values use the default. |
| `limit` | `20` | Positive integer page size; invalid values use the default and values above `100` are capped at `100`. |

Date query values use `YYYY-MM-DD`; one- or two-digit month/day components are
accepted and normalized. Calendar validity is checked. `date` cannot be used
with `startDate` or `endDate`. If both range endpoints are supplied,
`startDate` must be on or before `endDate`. A range can have either endpoint
open. For spreadsheet date cells, normalization accepts year-month-day or
year/month/day values, with an optional time suffix; missing or unrecognized
dates do not match a date filter.

`employeeId` must be a string of 1–128 characters. It must start with a letter
or digit and may otherwise contain letters, digits, `.`, `_`, `:`, `@`, or `-`.
Repeated filter parameters and non-string values are rejected. Empty filter
values are treated as omitted; whitespace-only values are invalid.

Malformed, zero, negative, repeated, or unsafe-integer pagination values fall
back to the default. Pagination does not return a validation error. A page past
the last page returns an empty `data` array.

Filtering runs on the role-scoped records before sorting and pagination.
`totalRecords` and `totalPages` describe the filtered result. Records are sorted
newest first using the first parseable value among `timestamp` and then `date`;
records with no parseable value sort last. Sorting uses JavaScript date parsing
for strings.

## Spreadsheet mapping

`sheets.js` reads the configured `SHEET_RANGE` as a two-dimensional array. The
controller treats the first row as headers and maps subsequent non-empty rows.

- Blank headers are skipped; header text is trimmed.
- Each cell is converted to a trimmed string. Missing or null cells become an
  empty string. Strings matching `^-?\d+$` are converted with JavaScript
  `Number`; other cell contents stay strings.
- Each non-empty header adds the original trimmed header as a property. A
  lowercase header key and a camelCase key are also added if those keys do not
  already exist. Header-derived keys can therefore vary and may collide; the
  original key is written first.
- The controller does not generate an `id`. Any ID must come from a sheet
  column.
- UID access matching recognizes `uid`, `user_id`, and
  `user id (firebase uid)`. Employee filtering recognizes those fields plus
  `employeeId`, `employeeID`, `employeeid`, `employee_id`, and `employee id`.

Employee-ID filtering trims the record value and compares it exactly, including
case, to the trimmed query value.

## Examples

```http
GET /api/v1/attendance/history?page=2&limit=25
GET /api/v1/attendance/history?date=2026-11-18
GET /api/v1/attendance/history?startDate=2026-11-01&endDate=2026-11-30
GET /api/v1/attendance/history?employeeId=EMP001
GET /api/v1/attendance/history?employeeId=EMP001&date=2026-11-18
```

The `employeeId` examples require an admin token; staff still receive only
UID-matched records.

## Successful response

```json
{
  "success": true,
  "count": 1,
  "totalRecords": 1,
  "currentPage": 1,
  "totalPages": 1,
  "data": [
    {
      "UID": "firebase-uid-example",
      "uid": "firebase-uid-example",
      "Date": "2026-11-18",
      "date": "2026-11-18",
      "Employee ID": "EMP001",
      "employee id": "EMP001",
      "employeeId": "EMP001",
      "Status": "Present",
      "status": "Present"
    }
  ]
}
```

The properties shown are produced by headers `UID`, `Date`, `Employee ID`, and
`Status`; actual record fields depend on the spreadsheet headers. Integer-like
cell strings appear as JSON numbers. The response always includes `success`,
`count` (current page length), `totalRecords` (filtered total), `currentPage`,
`totalPages`, and `data`. With no matching records, `count` and `totalRecords`
are `0`, `totalPages` is `0`, and `data` is `[]`.

## Errors

Authentication and filter/role errors use `{ "success": false, "message": "..." }`.

| HTTP status | Condition | Message |
|---:|---|---|
| 401 | Missing or malformed Bearer header | `Unauthorized: Missing or malformed Bearer token` |
| 401 | Token invalid or expired | `Unauthorized: Invalid or expired token` |
| 403 | Verified role is not `admin` or `staff` | `Forbidden: Invalid role` |
| 400 | Invalid date | `Bad Request: Invalid <parameter>. Use YYYY-MM-DD.` |
| 400 | Invalid employee ID | `Bad Request: Invalid employeeId.` |
| 400 | `date` combined with a range | `Bad Request: Use either date or startDate/endDate, not both.` |
| 400 | Reversed range | `Bad Request: Invalid date range. startDate must be on or before endDate.` |

The sheets service maps upstream failures as follows:

| HTTP status | Condition | Message |
|---:|---|---|
| 401 | Google authentication failure | `Google authentication failed` |
| 403 | Spreadsheet permission denied | `No permission to access the spreadsheet` |
| 400 | Invalid range | `Invalid spreadsheet range` |
| 404 | Spreadsheet or range not found | `Spreadsheet or range not found` |
| 502 | Other Google Sheets API failure | `Could not reach Google Sheets API` |

These errors use the Express error-handler shape:

```json
{
  "status": "error",
  "message": "Invalid spreadsheet range"
}
```

Other unhandled controller errors use the same shape with HTTP 500 unless they
carry an explicit status.

## Configuration

The endpoint needs Firebase Admin credentials:
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
Google Sheets reads require `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
`SPREADSHEET_ID`, and a valid `SHEET_RANGE`. The sheet service converts literal
`\n` sequences in the Google private key to newlines. Although the current
`backend/.env.example` comment describes `SHEET_RANGE` as optional, the service
provides no default, so set a valid range. Set `PORT` and
`FRONTEND_URL` for the server and CORS as needed. See `../.env.example` for
placeholder names and never put real credentials in documentation.
