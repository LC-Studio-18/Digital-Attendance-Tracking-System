<?php

namespace App\Services;

/** Friendly, shared copy for API and connectivity failures. */
final class ErrorMessages
{
    public const COPY = [
        'invalid-credentials' => 'Email or password is incorrect.',
        'unauthorized' => 'Your session has expired. Please sign in again.',
        'forbidden' => "You don't have access to this page.",
        'duplicate-clock-in' => "You're already clocked in.",
        'duplicate-clock-out' => "You're already clocked out.",
        'duplicate' => "You're already clocked in.",
        'server' => 'Something went wrong. Please try again.',
        'offline' => "You're offline. Check your connection and try again.",
        'network' => "We couldn't reach the server. Check your connection and try again.",
        'unknown' => 'Something went wrong. Please try again.',
    ];

    private const STATUS_TO_COPY_KEY = [
        401 => 'unauthorized',
        403 => 'forbidden',
        409 => 'duplicate',
        500 => 'server',
        502 => 'server',
        503 => 'server',
        504 => 'server',
    ];

    public static function resolve(mixed $code, ?string $fallback = null): string
    {
        $fallback ??= self::COPY['unknown'];

        if ($code === null || $code === '') {
            return $fallback;
        }

        if (is_int($code) || (is_string($code) && ctype_digit(trim($code)))) {
            $numeric = (int) $code;
            $key = self::STATUS_TO_COPY_KEY[$numeric] ?? null;

            return $key ? self::COPY[$key] : $fallback;
        }

        return self::COPY[(string) $code] ?? $fallback;
    }
}
