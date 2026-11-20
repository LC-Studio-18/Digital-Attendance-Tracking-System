# ST-01 - Install and Configure Firebase Admin SDK

## Information

- Ticket ID: S1-03b
- Subtask: ST-01 - Install and configure Firebase Admin SDK.
- Assigned developer: Not confirmed
- Current QA status: Partial Pass

## Objective

Verify that the backend Firebase Admin SDK is configured and functioning correctly, allowing the Express backend to authenticate Firebase ID tokens and retrieve verified user information.

## Acceptance Criteria

- [x] The backend successfully processes a valid Firebase ID token using Firebase Admin authentication.
- [x] The backend rejects invalid Firebase ID tokens.
- [x] The backend retrieves authenticated user information from a verified token.
- [ ] Firebase Admin SDK initialization and configuration have been independently inspected and verified.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Send a valid Firebase ID token to the protected backend endpoint | Backend successfully verifies the token and returns HTTP 200 | Pass |
| TC-02 | Send an invalid Firebase ID token to the protected backend endpoint | Backend rejects the token with HTTP 401 | Pass |
| TC-03 | Verify that the backend retrieves the authenticated user's Firebase identity | Backend returns the correct Firebase UID | Pass |
| TC-04 | Inspect Firebase Admin SDK initialization and configuration | SDK is correctly initialized using the intended Firebase project and appropriate backend credentials | Not Run |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Firebase Admin SDK Functional Verification

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Environment: Personal Windows laptop, Chrome DevTools, Postman, local Express backend
- Endpoint: `GET /api/protected-test`

### Preconditions

- Firebase Authentication is configured in the frontend.
- Backend development server is running on `http://127.0.0.1:5000`.
- Frontend development server is running.
- Valid Firebase test-user credentials are available.
- Backend has access to the Firebase Admin configuration required for token verification.

### Steps to Reproduce

1. Start the backend development server using `npm run dev`.
2. Start the frontend development server.
3. Open the application's login page.
4. Log in using valid Firebase test-user credentials.
5. Open Chrome DevTools and inspect the Firebase `signInWithPassword` response.
6. Copy the Firebase ID token for testing.
7. Open Postman.
8. Send `GET http://127.0.0.1:5000/api/protected-test` with the valid ID token in the `Authorization: Bearer <token>` header.
9. Record the HTTP status and response body.
10. Send the same request using an invalid token.
11. Record the HTTP status and response body.
12. Compare the UID returned by the backend with the Firebase `localId` from the authentication response.

### Expected Result

- The backend starts successfully.
- A valid Firebase ID token is accepted.
- The protected endpoint returns HTTP 200 for a valid token.
- The backend returns the authenticated user's Firebase UID.
- The returned UID matches Firebase's `localId`.
- An invalid Firebase ID token is rejected with HTTP 401.

### Actual Result

- The backend started successfully.
- The valid Firebase ID token was accepted.
- The protected endpoint returned HTTP 200.
- The response contained:
  - `status: success`
  - `message: You are authenticated`
  - `uid`: authenticated user's Firebase UID
  - `email`: authenticated user's email address
- The returned UID matched the Firebase `localId`.
- The backend rejected an invalid token with HTTP 401.
- The invalid-token response contained:
  - `status: error`
  - `message: Invalid authentication token`
  - `code: auth/argument-error`

### Result

**TC-01: Pass**

**TC-02: Pass**

**TC-03: Pass**

**TC-04: Not Run**

### Bug Reference

None.

### Evidence

- Backend startup confirmed in the terminal.
- Firebase `signInWithPassword` response inspected in Chrome DevTools.
- Valid-token response inspected in Postman.
- Invalid-token rejection confirmed through a terminal `curl` request.
- Backend UID compared manually with Firebase `localId`.
- No screenshots or exported response logs recorded.

### Notes

- Successful verification of Firebase-issued ID tokens provides functional evidence that the backend Firebase Admin authentication integration is operational.
- The Firebase Admin SDK initialization code and configuration were not independently inspected during this testing session.
- Successful authentication does not independently establish that credentials are stored securely. Credential security is assessed separately under S1-03b ST-07.
- The tests do not establish that every protected backend route uses Firebase authentication middleware.
- Staff/Admin role-based authorization is covered separately under S1-07.
- Firebase ID tokens, credentials and personal user identifiers are not included in this document.

## Overall QA Result

**Partial Pass**

Three functional test cases passed, demonstrating that the backend can accept valid Firebase ID tokens, reject invalid tokens and retrieve authenticated user identity information.

One test case remains Not Run: independent inspection of Firebase Admin SDK initialization and configuration.

No bugs were confirmed during this subtask's functional testing. Full QA verification remains pending completion of TC-04.