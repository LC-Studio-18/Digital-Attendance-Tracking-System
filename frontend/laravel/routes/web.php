<?php

use App\Http\Controllers\AttendanceHistoryController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\ReportsExportController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FeedbackController::class, 'index'])->name('home');

Route::get('/attendance-history', [AttendanceHistoryController::class, 'index'])
    ->name('attendance.history');

Route::get('/reports/export', [ReportsExportController::class, 'export'])
    ->name('reports.export');
