<?php

namespace Tests\Unit;

use App\Services\AttendanceDataStore;
use PHPUnit\Framework\TestCase;

class AttendanceDataStoreTest extends TestCase
{
    public function test_it_starts_empty_and_publishes_plain_arrays(): void
    {
        $store = new AttendanceDataStore();
        $this->assertSame([], $store->all());
        $this->assertSame([], $store->visible());

        $store->publish([['id' => 1], ['id' => 2]], [['id' => 2]]);

        $this->assertCount(2, $store->all());
        $this->assertCount(1, $store->visible());
        $this->assertSame(2, $store->visible()[0]['id']);
    }
}
