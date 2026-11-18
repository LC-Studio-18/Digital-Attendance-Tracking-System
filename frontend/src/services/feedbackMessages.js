/**
 * Central message library: every user-facing feedback message lives here.
 * Change wording in ONE place and the whole app stays consistent.
 *
 * Each entry:
 *   variant   'success' | 'error' | 'warning' | 'info'
 *   title     short headline
 *   message   one or two plain sentences (string, or a function of the
 *             previously recorded time when the API provides one)
 *   nextStep  'retry' | 'sign-in' | 'contact-admin' | 'fix-input' | 'none'
 *   retryable whether a "Try again" button makes sense
 *
 * Rules the copy follows: say what happened, say what to do next, never blame,
 * never show technical details, never claim attendance was saved unless the
 * system confirmed it.
 */

export function formatRecordedTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
}

const MESSAGES = {
  // 1. Failed login (same wording whether the user or the password is wrong,
  //    so it never reveals whether an account exists)
  loginFailed: {
    variant: 'error',
    title: 'We couldn’t sign you in',
    message: 'Check your login details and try again.',
    nextStep: 'fix-input',
    retryable: true,
  },

  // 2. Expired session
  sessionExpired: {
    variant: 'warning',
    title: 'Your session has ended',
    message: 'For your security, you were signed out. Sign in again to continue.',
    nextStep: 'sign-in',
    retryable: false,
  },

  // 3. No access
  noAccess: {
    variant: 'warning',
    title: 'This isn’t available for your account',
    message: 'If you think you should have access, please contact your administrator.',
    nextStep: 'contact-admin',
    retryable: false,
  },

  // 4. Already clocked in / out (time shown only when the API provides it)
  alreadyClockedIn: {
    variant: 'info',
    title: 'You’re already clocked in',
    message: (time) =>
      time
        ? `You clocked in at ${time}, so nothing new was recorded. Clock out when you leave.`
        : 'Your clock-in is already on record, so nothing new was recorded. Clock out when you leave.',
    nextStep: 'none',
    retryable: false,
  },
  alreadyClockedOut: {
    variant: 'info',
    title: 'You’re already clocked out',
    message: (time) =>
      time
        ? `You clocked out at ${time}, so nothing new was recorded. Clock in when you next arrive.`
        : 'Your clock-out is already on record, so nothing new was recorded. Clock in when you next arrive.',
    nextStep: 'none',
    retryable: false,
  },
  alreadyRecorded: {
    variant: 'info',
    title: 'This is already recorded',
    message: (time) =>
      time
        ? `This entry was recorded at ${time}, so nothing new was added.`
        : 'This entry is already on record, so nothing new was added.',
    nextStep: 'none',
    retryable: false,
  },

  // 5. Invalid request
  invalidRequest: {
    variant: 'error',
    title: 'We couldn’t process that',
    message: 'Some information is missing or not valid. Check it and try again.',
    nextStep: 'fix-input',
    retryable: true,
  },

  // 6. Server error (never implies the record was saved)
  serverError: {
    variant: 'error',
    title: 'The system isn’t responding right now',
    message:
      'Your attendance was not confirmed. Please try again in a moment. If it keeps happening, let your administrator know.',
    nextStep: 'retry',
    retryable: true,
  },

  // 7. No internet (never claims an offline entry was recorded)
  offline: {
    variant: 'warning',
    title: 'No internet connection',
    message:
      'We couldn’t confirm your attendance. Check your Wi-Fi or mobile data, then try again.',
    nextStep: 'retry',
    retryable: true,
  },

  // Extra cases the error mapper needs
  sheetsSyncFailed: {
    variant: 'error',
    title: 'We couldn’t confirm your attendance',
    message: 'The attendance sheet didn’t respond, so this entry may not be saved. Please try again in a moment.',
    nextStep: 'retry',
    retryable: true,
  },
  unknown: {
    variant: 'error',
    title: 'Something went wrong',
    message: 'The request didn’t complete. Please try again.',
    nextStep: 'retry',
    retryable: true,
  },
};

/**
 * Look up a message by key. `recordedAt` (ISO string or Date) is the
 * previously recorded time, if the API returned one.
 */
export function getMessage(key, { recordedAt } = {}) {
  const found = MESSAGES[key];
  const entry = found ?? MESSAGES.unknown;
  const time = formatRecordedTime(recordedAt);
  return {
    key: found ? key : 'unknown',
    variant: entry.variant,
    title: entry.title,
    message: typeof entry.message === 'function' ? entry.message(time) : entry.message,
    nextStep: entry.nextStep,
    retryable: entry.retryable,
  };
}

export default MESSAGES;
