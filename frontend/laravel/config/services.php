<?php

return [
    'api' => [
        'url' => env('API_BASE_URL', 'http://localhost:5000'),
        'history_path' => env('ATTENDANCE_HISTORY_PATH', '/api/v1/attendance/history'),
        'export_path' => env('REPORTS_EXPORT_PATH', '/api/reports/export'),
    ],
];
