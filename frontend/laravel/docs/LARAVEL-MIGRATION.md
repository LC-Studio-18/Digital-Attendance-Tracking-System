# Frontend-to-Laravel migration record (S2-20a)

## Scope

Only frontend work authored by **Rasoolking14** was ported to PHP/Laravel:

- S1-16 feedback components
- S1-21 attendance history filters
- S1-22a CSV export control and report API client
- S2-20a shared attendance data array for CSV export
- Attendance history page and supporting utilities

Not changed:

- `backend/` — still the teammates' Node/Express service
- React files written by teammates (project foundation from the initial commits)
- Git history on `main`

The Laravel app is added at `frontend/laravel/` rather than replacing the React
files in place. This keeps both stacks available while the team transitions.

## File mapping

| Original React/JS file (owner: Rasool) | Laravel/PHP equivalent |
| --- | --- |
| `src/components/Loader.jsx` | `resources/views/components/loader.blade.php` |
| `src/components/ErrorMessage.jsx` | `resources/views/components/error-message.blade.php` |
| `src/components/SuccessMessage.jsx` | `resources/views/components/success-message.blade.php` |
| `src/utils/errorMessages.js` | `app/Services/ErrorMessages.php` |
| `src/components/HistoryFilters.jsx` | `resources/views/components/history-filters.blade.php` |
| `src/utils/attendanceFilters.js` | `app/Services/AttendanceFilters.php` |
| `src/utils/csv.js` + `ExportCsvControl.jsx` | `app/Services/CsvExporter.php` + `resources/views/components/export-csv.blade.php` |
| `src/services/attendanceApi.js` | `app/Services/AttendanceApiClient.php` |
| `src/services/reportsApi.js` | `app/Http/Controllers/ReportsExportController.php` |
| `src/utils/authToken.js` | `app/Services/AuthSessionService.php` |
| `src/context/attendanceDataStore.js` + `AttendanceDataProvider.jsx` | `app/Services/AttendanceDataStore.php` (singleton in `AppServiceProvider`) |
| `src/pages/AttendanceHistoryPage.jsx` | `app/Http/Controllers/AttendanceHistoryController.php` + `resources/views/attendance-history.blade.php` |
| `src/App.jsx` (feedback preview route) | `app/Http/Controllers/FeedbackController.php` + `resources/views/feedback-previews.blade.php` |
| `src/styles/*.css` | copied unchanged to `public/css/` |
| `src/**/*.test.js(x)` | `tests/Unit/*` and `tests/Feature/AttendanceHistoryTest.php` |
| `docs/CSV-DATA-SHARING.md` | this document + `README.md` |

## How the CSV handoff works in Laravel

1. `AttendanceHistoryController@index` calls the Node API through
   `AttendanceApiClient`, applies the same filters as the React page, and calls
   `AttendanceDataStore::publish($records, $visible)`.
2. `AttendanceDataStore` is registered as a singleton, so it is the PHP
   equivalent of the React context.
3. `ReportsExportController@export` reads `AttendanceDataStore::all()` (falling
   back to the API when empty), applies the inclusive date range, and returns
   a UTF-8 CSV download with CRLF line endings.

The S2-03 developer can therefore build on `AttendanceDataStore` instead of
passing props through React:

```php
$records = app(\App\Services\AttendanceDataStore::class)->all();
$csv = \App\Services\CsvExporter::build($records);
```

## Behavioural differences from the React version

- Forms are server-rendered GET forms. Changing the date-mode select requires
  pressing **Apply filters** before the other inputs update; there is no
  client-side JavaScript in this port.
- The success toast is replaced by a note on the export form because a CSV
  response downloads directly rather than returning JSON.
- Firebase tokens are read from the `Authorization` header, a cookie, or the
  session. Payload decoding still only chooses UI columns — the Node backend
  remains responsible for real authorisation.
- Error copy, date handling, CSV escaping, status normalisation and filter
  behaviour were ported directly from the original utilities.

## Verification status

PHP 8.4.28 and Composer 2.11.2 were installed user-locally on this device and
`php artisan test` now passes: **12 tests, 35 assertions**. `composer.lock` is
committed so other machines install the same versions. See
`docs/LOCAL-PHP-SETUP.md` for install paths and verification details.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Feedback component previews |
| GET | `/attendance-history` | Filterable attendance table |
| GET | `/reports/export` | CSV download for the shared attendance array |
