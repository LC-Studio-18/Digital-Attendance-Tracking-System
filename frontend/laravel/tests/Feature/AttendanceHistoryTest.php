<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AttendanceHistoryTest extends TestCase
{
    public function test_history_page_publishes_records_used_by_the_csv_export(): void
    {
        Http::fake([
            '*' => Http::response([
                [
                    'id' => '1',
                    'date' => '2026-11-18T09:02:00Z',
                    'clockIn' => '2026-11-18T09:02:00Z',
                    'clockOut' => '2026-11-18T17:30:00Z',
                    'status' => 'OUT',
                    'staffName' => 'Alice Brown',
                    'email' => 'alice@example.com',
                    'department' => 'Facilities',
                ],
            ]),
        ]);

        $token = $this->adminToken();

        $this->withHeader('Authorization', "Bearer $token")
            ->get('/attendance-history')
            ->assertOk()
            ->assertSee('Alice Brown');

        $this->withHeader('Authorization', "Bearer $token")
            ->get('/reports/export?startDate=2026-11-18&endDate=2026-11-19')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->assertSee('Alice Brown');
    }

    public function test_api_failure_renders_safe_error_copy(): void
    {
        Http::fake(['*' => Http::response([], 503)]);

        $this->get('/attendance-history')
            ->assertOk()
            ->assertSee('Something went wrong. Please try again.');
    }

    private function adminToken(): string
    {
        $payload = rtrim(strtr(base64_encode((string) json_encode(['role' => 'admin'])), '+/', '-_'), '=');

        return "header.$payload.signature";
    }
}
