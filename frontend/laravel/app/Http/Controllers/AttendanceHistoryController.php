<?php

namespace App\Http\Controllers;

use App\Services\AttendanceApiClient;
use App\Services\AttendanceDataStore;
use App\Services\AttendanceFilters;
use App\Services\AuthSessionService;
use App\Services\ErrorMessages;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class AttendanceHistoryController extends Controller
{
    public function __construct(
        private readonly AttendanceApiClient $api,
        private readonly AttendanceDataStore $store,
        private readonly AuthSessionService $auth
    ) {}

    public function index(Request $request): View
    {
        $filters = $this->filtersFrom($request);
        $filterError = $this->validateRange($filters);

        $records = [];
        $apiError = null;

        if ($filterError === null) {
            $result = $this->api->history(AttendanceFilters::toApiParams($filters));
            $records = $result['records'];
            $apiError = $result['error'];
        }

        $visible = AttendanceFilters::filterRecords($records, $filters);
        $this->store->publish($records, $visible);

        $isAdmin = $this->auth->isAdmin();
        $columns = $isAdmin
            ? ['staff', 'email', 'department', 'date', 'clockIn', 'clockOut', 'duration', 'status']
            : ['date', 'clockIn', 'clockOut', 'duration', 'status'];

        return view('attendance-history', [
            'records' => $visible,
            'filters' => $filters,
            'dateMode' => (string) $request->input('date_mode', AttendanceFilters::MODE_RANGE),
            'employees' => $isAdmin ? AttendanceFilters::getEmployeeOptions($records) : [],
            'columns' => $columns,
            'isAdmin' => $isAdmin,
            'role' => $this->auth->role(),
            'isFiltered' => AttendanceFilters::hasActiveFilters($filters),
            'filterError' => $filterError,
            'errorMessage' => $apiError === null ? null : ErrorMessages::resolve($apiError),
        ]);
    }

    /** @return array<string, string> */
    private function filtersFrom(Request $request): array
    {
        $filters = [
            'date' => trim((string) $request->input('date', '')),
            'startDate' => trim((string) $request->input('start_date', '')),
            'endDate' => trim((string) $request->input('end_date', '')),
            'status' => (string) $request->input('status', ''),
            'search' => trim((string) $request->input('search', '')),
            // Staff must never be able to filter on another person's identity.
            'employee' => $this->auth->isAdmin() ? trim((string) $request->input('employee', '')) : '',
        ];

        return AttendanceFilters::normalizeDateFilters(
            $filters,
            (string) $request->input('date_mode', AttendanceFilters::MODE_RANGE)
        );
    }

    /** @param array<string, string> $filters */
    private function validateRange(array $filters): ?string
    {
        if ($filters['startDate'] !== '' && $filters['endDate'] !== '' && $filters['startDate'] > $filters['endDate']) {
            return 'The start date must be on or before the end date.';
        }

        return null;
    }
}
