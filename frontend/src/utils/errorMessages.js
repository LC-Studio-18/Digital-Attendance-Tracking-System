/**
 * Friendly copy for known API and connectivity failures.
 *
 * Keep this list in one place so every screen speaks with the same voice.
 * Never render a raw error, HTTP status or stack trace in the UI.
 */
export const ERROR_COPY = Object.freeze({
  'invalid-credentials': 'Email or password is incorrect.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: "You don't have access to this page.",
  'duplicate-clock-in': "You're already clocked in.",
  'duplicate-clock-out': "You're already clocked out.",
  duplicate: "You're already clocked in.",
  server: 'Something went wrong. Please try again.',
  offline: "You're offline. Check your connection and try again.",
  network: "We couldn't reach the server. Check your connection and try again.",
  unknown: 'Something went wrong. Please try again.',
});

const STATUS_TO_COPY_KEY = Object.freeze({
  401: 'unauthorized',
  403: 'forbidden',
  409: 'duplicate',
  500: 'server',
  502: 'server',
  503: 'server',
  504: 'server',
});

/**
 * Turn a status code or stable error code into user-facing copy.
 *
 * @param {number|string|null|undefined} code HTTP status (401, 403, 409, 500)
 *   or an application code such as "offline" or "duplicate-clock-out".
 * @param {string} fallback Copy used when the code is unknown.
 * @returns {string} Safe, friendly copy.
 */
export function resolveErrorMessage(code, fallback = ERROR_COPY.unknown) {
  if (code === null || code === undefined || code === '') {
    return fallback;
  }

  const numeric = Number(code);
  if (Number.isInteger(numeric) && String(code).trim() !== '') {
    const key = STATUS_TO_COPY_KEY[numeric];
    return key ? ERROR_COPY[key] : fallback;
  }

  return ERROR_COPY[String(code)] ?? fallback;
}
