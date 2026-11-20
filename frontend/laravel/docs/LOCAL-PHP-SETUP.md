# Local PHP & Composer setup (this device)

Installed on 2026-11-20 without admin rights or system-wide changes.

## Locations

| Tool | Version | Path |
| --- | --- | --- |
| PHP (CLI, NTS x64) | 8.4.28 | `C:\Users\Rasool\AppData\Local\dev-tools\php84` |
| Composer | 2.11.2 | `C:\Users\Rasool\AppData\Local\dev-tools\composer` |

Both directories were appended to the **user** PATH (not the system PATH), so
new terminals can run `php` and `composer` directly.

## What was configured

- `php.ini` copied from `php.ini-production`
- Enabled extensions: `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, `zip`
- `curl.cainfo` and `openssl.cafile` point to `cacert.pem` in the PHP directory
- `date.timezone = UTC`
- `composer.bat` wrapper created so `composer` works from CMD/PowerShell

## Verification

```powershell
php --version
composer --version

cd frontend/laravel
composer install
copy .env.example .env     # only needed once
php artisan key:generate   # only needed once
php artisan test
```

Result: **12 tests passed, 35 assertions**.

`.env`, `vendor/`, `bootstrap/cache/*.php` and `.phpunit.cache/` are ignored by
Git. `composer.lock` is committed so dependency versions stay consistent.

## Ports / app

```powershell
php artisan serve
```

Then open `http://localhost:8000/attendance-history`.

The Laravel app still reads the Node backend at `API_BASE_URL`
(default `http://localhost:5000`); no backend files were changed.
