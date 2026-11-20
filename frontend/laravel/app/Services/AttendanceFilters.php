<?php

namespace App\Services;

/** Date/status/search filtering shared by the page and the CSV export. */
final class AttendanceFilters
{
    public const MODE_ANY = 'any';
    public const MODE_SPECIFIC = 'specific';
    public const MODE_RANGE = 'range';

    /** @return array<string, string> */
    public static function empty(): array
    {
        return [
            'startDate' => '',
            'endDate' => '',
            'date' => '',
            'status' => '',
            'search' => '',
            'employee' => '',
        ];
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, string>
     */
    public static function normalizeDateFilters(array $filters, string $mode = self::MODE_RANGE): array
    {
        $next = array_merge(self::empty(), $filters);

        if ($mode === self::MODE_SPECIFIC) {
            $date = (string) ($next['date'] ?: $next['startDate']);
            $next['date'] = $date;
            $next['startDate'] = $date;
            $next['endDate'] = $date;
        } elseif ($mode === self::MODE_ANY) {
            $next['date'] = '';
            $next['startDate'] = '';
            $next['endDate'] = '';
        } else {
            $next['date'] = '';
        }

        return $next;
    }

    /** @param array<string, mixed> $filters */
    public static function hasActiveFilters(array $filters): bool
    {
        foreach ($filters as $value) {
            if ($value !== '' && $value !== null) {
                return true;
            }
        }

        return false;
    }

    /** @param array<string, mixed> $filters @return array<string, string> */
    public static function toApiParams(array $filters): array
    {
        $params = [];
        foreach ($filters as $key => $value) {
            if ($value !== '' && $value !== null) {
                $params[$key] = (string) $value;
            }
        }

        return $params;
    }

    /** @param array<string, mixed> $record */
    public static function getField(array $record, string ...$keys): mixed
    {
        foreach ($keys as $key) {
            $value = $record;
            foreach (explode('.', $key) as $part) {
                $value = is_array($value) ? ($value[$part] ?? null) : null;
            }
            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return '';
    }

    /** @param array<string, mixed> $record */
    public static function getRecordStatus(array $record): string
    {
        $raw = self::getField($record, 'status', 'state');
        if ($raw === '') {
            return '—';
        }

        $value = strtolower((string) $raw);
        if (str_contains($value, 'in') && ! str_contains($value, 'out')) {
            return 'IN';
        }
        if (str_contains($value, 'out')) {
            return 'OUT';
        }

        return strtoupper((string) $raw);
    }

    /** @param array<string, mixed> $record */
    public static function getEmployeeSearchText(array $record): string
    {
        $parts = [
            self::getField($record, 'staffId', 'employeeId', 'userId'),
            self::getField($record, 'staffName', 'employeeName', 'name', 'user.name'),
            self::getField($record, 'email', 'staffEmail', 'user.email'),
        ];

        return strtolower(implode(' ', array_filter($parts, fn ($p) => $p !== '')));
    }

    /**
     * @param array<int, array<string, mixed>> $records
     * @return array<int, array<string, string>>
     */
    public static function getEmployeeOptions(array $records): array
    {
        $options = [];

        foreach ($records as $record) {
            $id = self::getField($record, 'staffId', 'employeeId', 'userId');
            $name = self::getField($record, 'staffName', 'employeeName', 'name', 'user.name');
            $email = self::getField($record, 'email', 'staffEmail', 'user.email');
            if ($id === '' && $name === '' && $email === '') {
                continue;
            }

            $value = (string) ($name ?: $email ?: $id);
            $key = strtolower((string) ($email ?: $id ?: $value));
            if (isset($options[$key])) {
                continue;
            }

            $options[$key] = [
                'id' => (string) ($id ?: $key),
                'name' => $value,
                'email' => (string) $email,
                'value' => $value,
                'label' => $name && $email ? "$name ($email)" : $value,
            ];
        }

        $list = array_values($options);
        usort($list, fn (array $a, array $b) => strcasecmp($a['name'], $b['name']));

        return $list;
    }

    /**
     * Inclusive date filtering used by both the page and the CSV export.
     *
     * @param array<int, array<string, mixed>> $records
     * @param array<string, mixed> $range
     * @return array<int, array<string, mixed>>
     */
    public static function filterRecordsByDate(array $records, array $range): array
    {
        $start = (string) ($range['startDate'] ?? '');
        $end = (string) ($range['endDate'] ?? '');
        if ($start === '' && $end === '') {
            return $records;
        }

        return array_values(array_filter($records, function (array $record) use ($start, $end) {
            $raw = self::getField($record, 'date', 'createdAt', 'timestamp', 'clockIn', 'checkIn', 'inTime');
            if ($raw === '') {
                return false;
            }
            $key = self::toDateKey($raw);
            if ($key === '') {
                return false;
            }

            return ($start === '' || $key >= $start) && ($end === '' || $key <= $end);
        }));
    }

    /**
     * @param array<int, array<string, mixed>> $records
     * @param array<string, mixed> $filters
     * @return array<int, array<string, mixed>>
     */
    public static function filterRecords(array $records, array $filters): array
    {
        $dates = $filters;
        if (! empty($filters['date'])) {
            $dates['startDate'] = $filters['startDate'] ?: $filters['date'];
            $dates['endDate'] = $filters['endDate'] ?: $filters['date'];
        }
        $list = self::filterRecordsByDate($records, $dates);

        $status = (string) ($filters['status'] ?? '');
        $search = strtolower(trim((string) ($filters['search'] ?? '')));
        $employee = strtolower(trim((string) ($filters['employee'] ?? '')));
        if ($status === '' && $search === '' && $employee === '') {
            return $list;
        }

        return array_values(array_filter($list, function (array $record) use ($status, $search, $employee) {
            if ($status !== '' && self::getRecordStatus($record) !== $status) {
                return false;
            }
            if ($employee !== '' && ! str_contains(self::getEmployeeSearchText($record), $employee)) {
                return false;
            }
            if ($search === '') {
                return true;
            }

            $searchable = strtolower(implode(' ', [
                self::getField($record, 'staffName', 'employeeName', 'name', 'user.name'),
                self::getField($record, 'email', 'staffEmail', 'user.email'),
                self::getField($record, 'department', 'team'),
            ]));

            return str_contains($searchable, $search);
        }));
    }

    /** Normalise a date value to YYYY-MM-DD without shifting the day. */
    public static function toDateKey(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if (is_string($value) && preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $value, $matches)) {
            return "{$matches[1]}-{$matches[2]}-{$matches[3]}";
        }

        $timestamp = is_numeric($value) ? (int) $value : strtotime((string) $value);
        if ($timestamp === false) {
            return '';
        }

        return date('Y-m-d', $timestamp);
    }
}
