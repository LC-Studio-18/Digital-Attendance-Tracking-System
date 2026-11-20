<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/** Thin client for the Node backend that the teammate owns. */
class AttendanceApiClient
{
    public function __construct(private readonly AuthSessionService $auth) {}

    /**
     * @param array<string, string> $params
     * @return array{records: array<int, array<string, mixed>>, error: string|int|null}
     */
    public function history(array $params = []): array
    {
        $base = rtrim((string) config('services.api.url', env('API_BASE_URL', 'http://localhost:5000')), '/');
        $path = (string) config('services.api.history_path', env('ATTENDANCE_HISTORY_PATH', '/api/v1/attendance/history'));

        $request = Http::acceptJson()->timeout(10);
        $token = $this->auth->token();
        if ($token) {
            $request = $request->withToken($token);
        }

        try {
            $response = $request->get($base.$path, $params);
        } catch (ConnectionException) {
            return ['records' => [], 'error' => 'network'];
        }

        if ($response->failed()) {
            return ['records' => [], 'error' => $response->status()];
        }

        return ['records' => $this->toRecords($response->json()), 'error' => null];
    }

    /** Accept the array shapes the API may use and always return an array. */
    private function toRecords(mixed $data): array
    {
        if (is_array($data) && array_is_list($data)) {
            return $this->normalise($data);
        }
        if (! is_array($data)) {
            return [];
        }

        foreach (['history', 'records', 'results', 'attendance', 'data'] as $key) {
            if (isset($data[$key]) && is_array($data[$key]) && array_is_list($data[$key])) {
                return $this->normalise($data[$key]);
            }
        }

        return [];
    }

    /** @param array<int, mixed> $records @return array<int, array<string, mixed>> */
    private function normalise(array $records): array
    {
        return array_values(array_map(
            fn ($record) => is_array($record) ? $record : [],
            $records
        ));
    }
}
