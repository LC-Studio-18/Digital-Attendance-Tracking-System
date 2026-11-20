# Attendance data sharing for CSV export (S2-20a → S2-03)

## Purpose

`AttendanceHistoryPage` used to keep its records in local component state, so
another screen could not reach the array for a CSV export. The records are now
published through a small React context. The S2-03 developer can read a plain
array and pass it straight to the existing `ExportCsvControl`.

## What is shared

Import the hook from `src/context/attendanceDataStore.js`. The provider lives in
`src/context/AttendanceDataProvider.jsx` and is already mounted in `src/App.jsx`.

| Value | Type | Meaning |
| --- | --- | --- |
| `attendanceData` | array | Every record returned by the latest history request (all filters) |
| `visibleAttendanceData` | array | The records currently shown in the table (after client-side filters) |
| `setAttendanceData` | function | Replaces `attendanceData` |
| `setVisibleAttendanceData` | function | Replaces `visibleAttendanceData` |

Both arrays are always arrays — they start as `[]` before the first request and
stay `[]` on an error, so no null checks are needed. Each item is the raw record
object returned by `GET /api/v1/attendance/history`; nothing is stringified or
pre-formatted.

The provider wraps the routes in `src/App.jsx`, and `AttendanceHistoryPage`
updates the arrays whenever it loads, refreshes, or changes filters.

## How S2-03 exports it to CSV

The existing `ExportCsvControl` already accepts a `records` array. With its
`local` prop it builds the CSV in the browser using the shared helpers in
`src/utils/csv.js`; with no `local` prop it keeps calling the backend report
endpoint.

```jsx
import { ExportCsvControl } from '../components/index.js';
import { useAttendanceData } from '../context/attendanceDataStore.js';

function S2_03_ExportPanel() {
  const { attendanceData } = useAttendanceData();

  return (
    <ExportCsvControl
      records={attendanceData}
      local
      filename="attendance-export"
    />
  );
}
```

Use `visibleAttendanceData` instead when the export should match exactly what
the user currently sees in the history table.

`ExportCsvControl` handles the date range, inclusive filtering, CSV escaping,
the UTF-8 BOM and the browser download. Its default columns are Date, Staff,
Email, Department, Clock in, Clock out, Hours and Status; pass a `columns`
array to override them.

## Notes

- `useAttendanceData()` also works without a provider: it returns empty arrays
  and no-op setters, which keeps isolated component tests simple.
- The context only holds data already fetched by the history page — it does not
  make its own API calls. Render that page (or keep it mounted in the app) so
  the arrays are populated.
- For very large data sets, prefer the backend export endpoint
  (`exportAttendanceReport()` in `src/services/reportsApi.js`) instead of the
  `local` path.
