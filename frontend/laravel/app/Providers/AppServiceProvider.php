<?php

namespace App\Providers;

use App\Services\AttendanceDataStore;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // One store per request: the PHP equivalent of the React context that
        // shares the attendance array with the S2-03 CSV export screen.
        $this->app->singleton(AttendanceDataStore::class, fn () => new AttendanceDataStore());
    }

    public function boot(): void
    {
        //
    }
}
