import { describe, expect, it } from 'vitest';
import { ERROR_COPY, resolveErrorMessage } from './errorMessages.js';

describe('resolveErrorMessage', () => {
  it('maps numeric status codes', () => {
    expect(resolveErrorMessage(401)).toBe(ERROR_COPY.unauthorized);
    expect(resolveErrorMessage(403)).toBe(ERROR_COPY.forbidden);
    expect(resolveErrorMessage(409)).toBe(ERROR_COPY.duplicate);
    expect(resolveErrorMessage(500)).toBe(ERROR_COPY.server);
  });

  it('maps numeric strings from an API response', () => {
    expect(resolveErrorMessage('403')).toBe(ERROR_COPY.forbidden);
  });

  it('maps stable application codes', () => {
    expect(resolveErrorMessage('invalid-credentials')).toBe(
      ERROR_COPY['invalid-credentials']
    );
    expect(resolveErrorMessage('duplicate-clock-in')).toBe(
      ERROR_COPY['duplicate-clock-in']
    );
    expect(resolveErrorMessage('offline')).toBe(ERROR_COPY.offline);
  });

  it('uses the safe fallback instead of echoing an unknown value', () => {
    expect(resolveErrorMessage(418)).toBe(ERROR_COPY.unknown);
    expect(resolveErrorMessage('ECONNRESET')).toBe(ERROR_COPY.unknown);
    expect(resolveErrorMessage(undefined)).toBe(ERROR_COPY.unknown);
  });

  it('accepts a custom fallback for a specific screen', () => {
    expect(resolveErrorMessage('unexpected', 'Please refresh the page.')).toBe(
      'Please refresh the page.'
    );
  });
});
