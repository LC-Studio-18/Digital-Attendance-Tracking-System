/**
 * Turns whatever your API layer throws into one consistent shape:
 *   { type, title, message, nextStep, retryable }
 *
 * nextStep is one of: 'retry' | 'sign-in' | 'contact-admin' | 'fix-input' | 'none'
 *
 * It reads the status from either an Axios-style error (error.response.status)
 * or a fetch-style error (error.status).
 *
 * TODO(confirm with backend): the `code` values below (DUPLICATE_ATTENDANCE,
 * SHEETS_SYNC_FAILED...) are placeholders. Replace them with the codes your
 * API really returns. Nothing here assumes how Google Sheets reports failure.
 */

const DUPLICATE_CODES = ['DUPLICATE_ATTENDANCE', 'ALREADY_CLOCKED_IN', 'ALREADY_CLOCKED_OUT'];
const SHEETS_CODES = ['SHEETS_SYNC_FAILED', 'SHEETS_ERROR', 'SHEETS_UNAVAILABLE'];
const EXPIRED_CODES = ['SESSION_EXPIRED', 'TOKEN_EXPIRED'];

export const ERROR_TYPES = {
  OFFLINE: 'offline',
  AUTH_FAILED: 'auth-failed',
  SESSION_EXPIRED: 'session-expired',
  UNAUTHORISED: 'unauthorised',
  DUPLICATE: 'duplicate',
  INVALID: 'invalid-request',
  SHEETS: 'sheets-sync',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

const CATALOGUE = {
  [ERROR_TYPES.OFFLINE]: {
    title: 'No internet connection',
    message: 'We could not reach the attendance service. Your attendance has not been recorded.',
    nextStep: 'retry',
    retryable: true,
  },
  [ERROR_TYPES.AUTH_FAILED]: {
    title: 'Sign-in failed',
    message: 'The details you entered do not match our records. Check them and try again.',
    nextStep: 'fix-input',
    retryable: true,
  },
  [ERROR_TYPES.SESSION_EXPIRED]: {
    title: 'Your session has expired',
    message: 'For your security you were signed out. Sign in again to continue.',
    nextStep: 'sign-in',
    retryable: false,
  },
  [ERROR_TYPES.UNAUTHORISED]: {
    title: 'You do not have access',
    message: 'Your account is not allowed to do this. Contact your administrator if you think this is a mistake.',
    nextStep: 'contact-admin',
    retryable: false,
  },
  [ERROR_TYPES.DUPLICATE]: {
    title: 'Already recorded',
    message: 'This attendance entry has already been submitted, so nothing new was recorded.',
    nextStep: 'none',
    retryable: false,
  },
  [ERROR_TYPES.INVALID]: {
    title: 'We could not process that request',
    message: 'Some of the information sent was not valid. Check it and try again.',
    nextStep: 'fix-input',
    retryable: true,
  },
  [ERROR_TYPES.SHEETS]: {
    title: 'Attendance could not be synced',
    message: 'The attendance sheet did not respond, so this entry may not be saved. Try again in a moment.',
    nextStep: 'retry',
    retryable: true,
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Something went wrong on our side',
    message: 'The attendance service had a problem. Try again. If it keeps happening, tell your administrator.',
    nextStep: 'retry',
    retryable: true,
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Something went wrong',
    message: 'The request did not complete. Try again.',
    nextStep: 'retry',
    retryable: true,
  },
};

function readStatus(error) {
  return error?.response?.status ?? error?.status ?? null;
}

function readCode(error) {
  const data = error?.response?.data;
  return data?.code ?? data?.errorCode ?? error?.code ?? null;
}

function readServerMessage(error) {
  const data = error?.response?.data;
  return typeof data?.message === 'string' ? data.message : null;
}

function classify(error, isAuthRequest) {
  const status = readStatus(error);
  const code = readCode(error);

  const noResponse = status === null;
  const networkFailure =
    noResponse &&
    (error?.code === 'ERR_NETWORK' ||
      error?.name === 'TypeError' ||
      /network|failed to fetch/i.test(error?.message || ''));

  if ((typeof navigator !== 'undefined' && navigator.onLine === false) || networkFailure) {
    return ERROR_TYPES.OFFLINE;
  }
  if (DUPLICATE_CODES.includes(code) || status === 409) return ERROR_TYPES.DUPLICATE;
  if (SHEETS_CODES.includes(code)) return ERROR_TYPES.SHEETS;
  if (EXPIRED_CODES.includes(code)) return ERROR_TYPES.SESSION_EXPIRED;
  if (status === 401) return isAuthRequest ? ERROR_TYPES.AUTH_FAILED : ERROR_TYPES.SESSION_EXPIRED;
  if (status === 403) return ERROR_TYPES.UNAUTHORISED;
  if (status === 400 || status === 422) return ERROR_TYPES.INVALID;
  if (status >= 500) return ERROR_TYPES.SERVER;
  return ERROR_TYPES.UNKNOWN;
}

/**
 * @param {unknown} error  whatever was thrown by the API call
 * @param {{ isAuthRequest?: boolean }} [options]  pass true for the login call,
 *        because a 401 on login means "wrong credentials", not "session expired".
 */
export function mapApiError(error, { isAuthRequest = false } = {}) {
  const type = classify(error, isAuthRequest);
  const entry = CATALOGUE[type];
  const serverMessage = readServerMessage(error);

  // Only trust the server's wording for cases where it helps the user act on it.
  const useServerMessage = serverMessage && (type === ERROR_TYPES.INVALID || type === ERROR_TYPES.DUPLICATE);

  return {
    type,
    title: entry.title,
    message: useServerMessage ? serverMessage : entry.message,
    nextStep: entry.nextStep,
    retryable: entry.retryable,
  };
}

export default mapApiError;