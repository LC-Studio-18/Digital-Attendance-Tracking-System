# BUG-S1-19-01 - Invalid Email Triggers Firebase Authentication Request

## Information

- **Bug ID:** BUG-S1-19-01
- **Ticket ID:** S1-19
- **Subtask:** ST-04 - Add Form Validation
- **Assigned Developer:** Imaan
- **Reported By:** Team 3 QA
- **Date Reported:** 19 November 2026
- **Severity:** Medium (proposed)
- **Status:** Open

## Description

The login page displays an invalid-email validation message but still sends an authentication request to Firebase when an incorrectly formatted email address is submitted.

This violates the acceptance criterion requiring invalid email formats to be validated before anything is sent.

## Environment

- **QA Branch:** `QA3`
- **Developer Branch:** `frontend3-feature/s1-07-admin-controls`
- **Commit SHA:** Not recorded at test execution
- **Frontend:** React / Vite
- **Environment:** Local development
- **Browser:** Not recorded

## Preconditions

- Firebase Web app configuration is completed.
- Login page is accessible.
- Browser Developer Tools are open with Network logging enabled.

## Steps to Reproduce

1. Open the login page.
2. Open Developer Tools and select the Network tab.
3. Enable **Preserve log** and clear existing requests.
4. Enter `aviv.com` in the email field.
5. Enter a non-sensitive test password.
6. Click **Login**.
7. Observe the validation message and Network requests.

## Expected Result

- The application displays an invalid-email validation message.
- No Firebase authentication request is sent.
- The user remains on the login page.

## Actual Result

- The application displays: "Please enter a valid email address."
- A new POST request is sent to Firebase's `accounts:signInWithPassword` endpoint.
- Firebase returns HTTP `400 Bad Request`.
- Developer Tools identifies `authService.js:91` as the request initiator.
- The issue was reproduced during a second controlled test.

## Test Result

**Fail - S1-19 ST-04 TC-05**

## Impact

- Frontend validation does not prevent invalid email formats from reaching Firebase Authentication.
- Unnecessary authentication requests are generated.
- The implementation does not satisfy the pre-submission validation acceptance criterion.

## Evidence

- Browser Network tab screenshot showing the Firebase authentication request returning HTTP 400.
- Browser console output showing the POST request initiated from `authService.js:91`.
- Reproduced using the invalid email address `aviv.com`.

**Note:** Evidence files should be saved in the team's agreed evidence directory. Remove or redact credentials, tokens and unnecessary query parameters before sharing screenshots.

## Retest Criteria

1. Open the login page after the developer's fix.
2. Enter an invalid email address such as `aviv.com`.
3. Enter a test password and click Login.
4. Verify that the invalid-email message appears.
5. Verify in the Network tab that no Firebase authentication request is sent.
6. Repeat with additional invalid email formats.
7. Confirm that valid email addresses can still proceed to authentication.

## Retest History

- **Date:** Not yet retested
- **Fix Commit / PR:** Pending
- **Retest Result:** Not Run
- **Verified By:** Pending

## Notes

- The HTTP 400 response is from Firebase rejecting the authentication request. The reported defect is the frontend sending that request despite invalid email-format validation.
- Only QA should close this bug after verifying the fix.
