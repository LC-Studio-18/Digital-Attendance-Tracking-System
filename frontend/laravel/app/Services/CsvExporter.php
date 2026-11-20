<?php

namespace App\Services;

use Illuminate\Http\Response;

/** Client-side CSV builder extracted from src/utils/csv.js and ExportCsvControl. */
final class CsvExporter
{
    /** @return array<int, array{key: string, label: string, getValue: callable}> */
    public static function defaultColumns(): array
    {
        return [
            ['key' => 'date', 'label' => 'Date', 'getValue' => fn (array $r) => self::formatDate(AttendanceFilters::getField($r, 'date', 'createdAt', 'timestamp'))],
            ['key' => 'staff', 'label' => 'Staff', 'getValue' => fn (array $r) => self::textOrDash(AttendanceFilters::getField($r, 'staffName', 'employeeName', 'name', 'user.name'))],
            ['key' => 'email', 'label' => 'Email', 'getValue' => fn (array $r) => self::textOrDash(AttendanceFilters::getField($r, 'email', 'staffEmail', 'user.email'))],
            ['key' => 'department', 'label' => 'Department', 'getValue' => fn (array $r) => self::textOrDash(AttendanceFilters::getField($r, 'department', 'team'))],
            ['key' => 'clockIn', 'label' => 'Clock in', 'getValue' => fn (array $r) => self::formatTime(AttendanceFilters::getField($r, 'clockIn', 'checkIn', 'inTime'))],
            ['key' => 'clockOut', 'label' => 'Clock out', 'getValue' => fn (array $r) => self::formatTime(AttendanceFilters::getField($r, 'clockOut', 'checkOut', 'outTime'))],
            ['key' => 'duration', 'label' => 'Hours', 'getValue' => fn (array $r) => self::duration($r)],
            ['key' => 'status', 'label' => 'Status', 'getValue' => fn (array $r) => strtoupper(self::textOrDash(AttendanceFilters::getField($r, 'status', 'state')))],
        ];
    }

    public static function escape(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $text = (string) $value;

        return preg_match('/[",\r\n]/', $text) ? '"'.str_replace('"', '""', $text).'"' : $text;
    }

    /**
     * @param array<int, array<string, mixed>> $records
     * @param array<int, array{key: string, label: string, getValue: callable}>|null $columns
     */
    public static function build(array $records, ?array $columns = null): string
    {
        $columns ??= self::defaultColumns();
        $lines = [implode(',', array_map(fn (array $c) => self::escape($c['label']), $columns))];

        foreach ($records as $record) {
            $row = [];
            foreach ($columns as $column) {
                $row[] = self::escape(($column['getValue'])(is_array($record) ? $record : []));
            }
            $lines[] = implode(',', $row);
        }

        return implode("\r\n", $lines)."\r\n";
    }

    /** @param array<int, array<string, mixed>> $records */
    public static function response(array $records, string $filename = 'attendance-report.csv'): Response
    {
        $safeName = str_ends_with($filename, '.csv') ? $filename : "$filename.csv";
        $safeName = str_replace(['"', "\r", "\n"], '', $safeName);

        return new Response("\xEF\xBB\xBF".self::build($records), 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$safeName.'"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public static function textOrDash(mixed $value): string
    {
        return $value === '' || $value === null ? '—' : (string) $value;
    }

    public static function formatDate(mixed $value): string
    {
        if ($value === '' || $value === null) {
            return '—';
        }
        $timestamp = strtotime((string) $value);

        return $timestamp === false ? (string) $value : date('d M Y', $timestamp);
    }

    public static function formatTime(mixed $value): string
    {
        if ($value === '' || $value === null) {
            return '—';
        }
        $timestamp = strtotime((string) $value);

        return $timestamp === false ? (string) $value : date('H:i', $timestamp);
    }

    /** @param array<string, mixed> $record */
    public static function duration(array $record): string
    {
        $supplied = AttendanceFilters::getField($record, 'duration', 'totalHours', 'hours');
        if ($supplied !== '') {
            return (string) $supplied;
        }

        $start = strtotime((string) AttendanceFilters::getField($record, 'clockIn', 'checkIn', 'inTime'));
        $end = strtotime((string) AttendanceFilters::getField($record, 'clockOut', 'checkOut', 'outTime'));
        if ($start === false || $end === false || $end <= $start) {
            return '—';
        }

        $minutes = (int) round(($end - $start) / 60);

        return intdiv($minutes, 60).'h '.($minutes % 60).'m';
    }
}
