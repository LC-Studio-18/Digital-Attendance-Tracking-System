# Laravel frontend (Rasool's frontend work)

This is a Laravel port of the frontend features owned by Rasoolking14. It lives
in its own directory so the React files written by teammates and the Node
backend remain unchanged.

## What is included

- S1-16 feedback states: Loader, ErrorMessage, SuccessMessage (Blade components)
- S1-21 date/employee/status filters for attendance history
- S1-22a CSV export control and backend report API client
- S2-20a shared attendance array for the S2-03 CSV export work
- Attendance history page with admin/staff columns
- Friendly, shared error copy

See `docs/LARAVEL-MIGRATION.md` for the full file-by-file mapping.

## Setup

Requires PHP 8.2+ and Composer.

```bash
cd frontend/laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

Then open:

- `http://localhost:8000/` — feedback component previews
- `http://localhost:8000/attendance-history` — attendance history
- `http://localhost:8000/reports/export?startDate=2026-11-01&endDate=2026-11-30` — CSV download

The Laravel app reads the Node backend at `API_BASE_URL` (default
`http://localhost:5000`). No backend files were changed.

## Tests

```bash
composer test
# or
php artisan test
```

Note: PHP and Composer were not installed in the environment where this port
was written, so the tests have not been executed here. Run them after
`composer install`.
