<?php

namespace Tests\Unit;

use App\Services\AttendanceFilters;
use PHPUnit\Framework\TestCase;

class AttendanceFiltersTest extends TestCase
{
    public function test_status_is_normalised_from_raw_values(): void
    {
        $this->assertSame('IN', AttendanceFilters::getRecordStatus(['status' => 'clock_in']));
        $this->assertSame('OUT', AttendanceFilters::getRecordStatus(['state' => 'checked out']));
        $this->assertSame('—', AttendanceFilters::getRecordStatus([]));
    }

    public function test_specific_date_mode_mirrors_the_date_into_the_range(): void
    {
        $filters = AttendanceFilters::normalizeDateFilters([
            'date' => '2026-11-18',
            'startDate' => '',
            'endDate' => '',
        ], AttendanceFilters::MODE_SPECIFIC);

        $this->assertSame('2026-11-18', $filters['startDate']);
        $this->assertSame('2026-11-18', $filters['endDate']);
    }

    public function test_it_filters_by_inclusive_date_and_status(): void
    {
        $records = [
            ['date' => '2026-11-17T08:00:00Z', 'status' => 'IN'],
            ['date' => '2026-11-18T08:00:00Z', 'status' => 'OUT'],
            ['date' => '2026-11-19T08:00:00Z', 'status' => 'IN'],
        ];

        $filtered = AttendanceFilters::filterRecords($records, [
            'startDate' => '2026-11-18',
            'endDate' => '2026-11-19',
            'status' => 'IN',
        ]);

        $this->assertCount(1, $filtered);
        $this->assertSame('2026-11-19T08:00:00Z', $filtered[0]['date']);
    }

    public function test_employee_options_are_unique_and_sorted(): void
    {
        $options = AttendanceFilters::getEmployeeOptions([
            ['staffName' => 'Bob', 'email' => 'bob@example.com', 'staffId' => '2'],
            ['staffName' => 'Alice', 'email' => 'alice@example.com', 'staffId' => '1'],
            ['staffName' => 'Alice', 'email' => 'alice@example.com', 'staffId' => '1'],
        ]);

        $this->assertCount(2, $options);
        $this->assertSame('Alice', $options[0]['name']);
    }
}
