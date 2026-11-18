import { getMessage } from './feedbackMessages';

/**
 * Turns whatever your API layer throws into a message from feedbackMessages.js:
 *   { key, variant, title, message, nextStep, retryable }
 *
 * Reads the status from an Axios-style error (error.response.status) or a
 * fetch-style error (error.status).
 *
 * Options:
 *   isAuthRequest  true for the login call (a 401 there means wrong details,
 *                  not an expired session)
 *   action         'clock-in' | 'clock-out' (picks the right "already..." wording)
 *   recordedAt     the earlier recorded time, if your API returns one
 *
 * TODO(confirm with backend): the `code` values below are placeholders.
 * Replace them with the codes the API really returns. Server wording is never
 * shown to users, so technical details cannot leak into the interface.
 */

const DUPLICATE_CODES = ['DUPLICATE_ATTENDANCE', 'ALREADY_CLOCKED_IN', 'ALREADY_CLOCKED_OUT'];
const SHEETS_CODES = ['SHEETS_SYNC_FAILED', 'SHEETS_ERROR', 'SHEETS_UNAVAILABLE'];
const EXPIRED_CODES = ['SESSION_EXPIRED', 'TOKEN_EXPIRED'];

const readStatus = (error) => error?.response?.status ?? error?.status ?? null;
const readCode = (error) => {
  const data = error?.response?.data;
  return data?.code ?? data?.errorCode ?? error?.code ?? null;
};

function duplicateKey(action) {
  if (action === 'clock-in') return 'alreadyClockedIn';
  if (action === 'clock-out') return 'alreadyClockedOut';
  return 'alreadyRecorded';
}

function classify(error, { isAuthRequest, action }) {
  const status = readStatus(error);
  const code = readCode(error);

  const networkFailure =
    status === null &&
    (error?.code === 'ERR_NETWORK' ||
      error?.name === 'TypeError' ||
      /network|failed to fetch/i.test(error?.message || ''));

  if ((typeof navigator !== 'undefined' && navigator.onLine === false) || networkFailure) return 'offline';
  if (DUPLICATE_CODES.includes(code) || status === 409) return duplicateKey(action);
  if (SHEETS_CODES.includes(code)) return 'sheetsSyncFailed';
  if (EXPIRED_CODES.includes(code)) return 'sessionExpired';
  if (status === 401) return isAuthRequest ? 'loginFailed' : 'sessionExpired';
  if (status === 403) return 'noAccess';
  if (status === 400 || status === 422) return 'invalidRequest';
  if (status >= 500) return 'serverError';
  return 'unknown';
}

export function mapApiError(error, { isAuthRequest = false, action, recordedAt } = {}) {
  return getMessage(classify(error, { isAuthRequest, action }), { recordedAt });
}

export default mapApiError;
