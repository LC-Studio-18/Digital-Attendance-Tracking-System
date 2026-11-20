<?php

namespace App\Services;

/**
 * Shared, plain PHP arrays for the attendance records fetched by the history
 * page. Registered as a singleton in AppServiceProvider so the CSV export
 * controller can read exactly what the page loaded.
 */
class AttendanceDataStore
{
    /** @var array<int, array<string, mixed>> */
    private array $all = [];

    /** @var array<int, array<string, mixed>> */
    private array $visible = [];

    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        return $this->all;
    }

    /** @return array<int, array<string, mixed>> */
    public function visible(): array
    {
        return $this->visible;
    }

    /** @param array<int, array<string, mixed>> $records */
    public function setAll(array $records): void
    {
        $this->all = array_values($records);
    }

    /** @param array<int, array<string, mixed>> $records */
    public function setVisible(array $records): void
    {
        $this->visible = array_values($records);
    }

    /**
     * @param array<int, array<string, mixed>> $all
     * @param array<int, array<string, mixed>> $visible
     */
    public function publish(array $all, array $visible): void
    {
        $this->setAll($all);
        $this->setVisible($visible);
    }

    public function clear(): void
    {
        $this->all = [];
        $this->visible = [];
    }
}
