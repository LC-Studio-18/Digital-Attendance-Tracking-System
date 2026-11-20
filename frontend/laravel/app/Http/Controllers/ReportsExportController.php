<?php

namespace App\Http\Controllers;

use App\Services\AttendanceApiClient;
use App\Services\AttendanceDataStore;
use App\Services\AttendanceFilters;
use App\Services\CsvExporter;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportsExportController extends Controller
{
    public function __construct(
        private readonly AttendanceDataStore $store,
        private readonly AttendanceApiClient $api
    ) {}

    public function export(Request $request): Response
    {
        $start = trim((string) ($request->input('startDate') ?? $request->input('start_date', '')));
        $end = trim((string) ($request->input('endDate') ?? $request->input('end_date', '')));

        if ($start !== '' && $end !== '' && $start > $end) {
            abort(422, 'The start date must be on or before the end date.');
        }

        // Prefer the array already published by the history page (the Laravel
        // equivalent of the shared React context), then fall back to the API.
        $records = $this->store->all();
        if ($records === []) {
            $params = AttendanceFilters::toApiParams([
                'startDate' => $start,
                'endDate' => $end,
            ]);
            $records = $this->api->history($params)['records'];
        }

        $records = AttendanceFilters::filterRecordsByDate($records, [
            'startDate' => $start,
            'endDate' => $end,
        ]);

        return CsvExporter::response($records, 'attendance-report.csv');
    }
}
