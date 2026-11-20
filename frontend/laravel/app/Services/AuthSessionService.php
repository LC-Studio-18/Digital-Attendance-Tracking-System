<?php

namespace App\Services;

use Illuminate\Http\Request;

/**
 * Reads the Firebase ID token from the current request and derives the UI role.
 *
 * Decoding the JWT payload is enough to choose which columns to render. It is
 * NOT authorisation — the Node backend must verify the signature and enforce
 * roles on every protected endpoint.
 */
class AuthSessionService
{
    private const TOKEN_KEYS = ['firebaseIdToken', 'idToken', 'authToken', 'token'];

    public function __construct(private readonly Request $request) {}

    public function token(): ?string
    {
        $bearer = $this->request->bearerToken();
        if ($bearer) {
            return $bearer;
        }

        foreach (self::TOKEN_KEYS as $key) {
            $value = $this->readKey($key);
            if ($value !== null) {
                return $value;
            }
        }

        return null;
    }

    /** @return array<string, mixed> */
    public function claims(): array
    {
        $token = $this->token();
        if (! $token) {
            return [];
        }

        $parts = explode('.', $token);
        if (count($parts) < 2 || $parts[1] === '') {
            return [];
        }

        $payload = strtr($parts[1], '-_', '+/');
        $payload .= str_repeat('=', (4 - strlen($payload) % 4) % 4);
        $decoded = base64_decode($payload, true);
        if ($decoded === false) {
            return [];
        }

        $claims = json_decode($decoded, true);

        return is_array($claims) ? $claims : [];
    }

    public function role(): string
    {
        $claims = $this->claims();
        $role = $claims['role'] ?? $claims['userRole'] ?? null;

        if (is_string($role) && strtolower(trim($role)) === 'admin') {
            return 'admin';
        }

        if (($claims['admin'] ?? false) === true) {
            return 'admin';
        }

        $roles = $claims['roles'] ?? [];
        if (is_array($roles)) {
            foreach ($roles as $item) {
                if (is_string($item) && strtolower($item) === 'admin') {
                    return 'admin';
                }
            }
        }

        return 'staff';
    }

    public function isAdmin(): bool
    {
        return $this->role() === 'admin';
    }

    private function readKey(string $key): ?string
    {
        $value = $this->request->cookie($key);

        if (! $value && $this->request->hasSession()) {
            $value = $this->request->session()->get($key);
        }

        return is_string($value) && $value !== '' ? $value : null;
    }
}
