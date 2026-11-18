# Feedback messages: when each one appears

All wording lives in `src/services/feedbackMessages.js`.
`mapApiError(error, { isAuthRequest, action, recordedAt })` picks the message.
Show it with `FeedbackMessage` (compact, in context) or `ErrorState` (whole section).

| # | Scenario | Key | Type | Appears when | Where | Next step |
|---|---|---|---|---|---|---|
| 1 | Failed login | `loginFailed` | error | Login call is rejected (use `isAuthRequest: true`) | Above the login form | Check details, try again |
| 2 | Expired session | `sessionExpired` | warning | Any signed-in call is rejected as unauthenticated | Top of the page, then the login screen | Sign in again |
| 3 | No access | `noAccess` | warning | The API refuses an action for this account | Where the feature would be | Contact administrator |
| 4 | Already clocked in | `alreadyClockedIn` | info | A duplicate clock-in is rejected (pass `action: 'clock-in'`) | Above the clock button | Clock out when leaving |
| 4 | Already clocked out | `alreadyClockedOut` | info | A duplicate clock-out is rejected (pass `action: 'clock-out'`) | Above the clock button | Clock in next arrival |
| 5 | Invalid request | `invalidRequest` | error | The API says the submitted data is invalid or incomplete | Next to the form or action | Correct it, try again |
| 6 | Server error | `serverError` | error | The service fails with a server-side error | Above the action | Try again |
| 7 | No internet | `offline` | warning | The device is offline or the request cannot reach the server | Above the action; dashboard banner | Reconnect, try again |
| - | Sheets sync failed | `sheetsSyncFailed` | error | The API reports the sheet could not be updated | Above the action | Try again |
| - | Anything else | `unknown` | error | No other case matches | Above the action | Try again |

## Rules
- Success is shown only by `AttendanceConfirmation`, and only after the API confirms the record.
- No message ever says attendance was saved unless it was confirmed.
- Offline messages say the attendance "could not be confirmed". There is no offline clock-in mechanism.
- The previous time in "already clocked in/out" appears only when the API returns it and the caller passes `recordedAt`.
- Server wording is never shown to users.

## Still to confirm with the backend
- The real status or error codes for duplicates, expired sessions and Sheets failures (placeholders in `mapApiError.js`).
- Whether a duplicate response includes the earlier time, and in which field.
