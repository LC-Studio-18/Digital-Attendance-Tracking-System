<?php

namespace Tests\Unit;

use App\Services\ErrorMessages;
use PHPUnit\Framework\TestCase;

class ErrorMessagesTest extends TestCase
{
    public function test_status_codes_map_to_approved_copy(): void
    {
        $this->assertSame(
            'Your session has expired. Please sign in again.',
            ErrorMessages::resolve(401)
        );
        $this->assertSame(
            'Something went wrong. Please try again.',
            ErrorMessages::resolve('500')
        );
    }

    public function test_application_codes_and_unknown_fallback(): void
    {
        $this->assertSame("You're offline. Check your connection and try again.", ErrorMessages::resolve('offline'));
        $this->assertSame('Custom fallback', ErrorMessages::resolve('unexpected', 'Custom fallback'));
    }
}
