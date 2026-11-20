# ST-03 - Extract the User's Firebase UID from Verified Tokens

## Information

- Ticket ID: S1-03b
- Subtask: ST-03 - Extract the user’s Firebase UID from verified tokens.
- Assigned developer: Not confirmed
- Current QA status: Pass

## Objective

Verify that the backend correctly extracts the authenticated user's Firebase UID from a verified ID token.

## Acceptance Criteria

- [x] The backend accepts a valid Firebase ID token.
- [x] The backend extracts the authenticated user's UID.
- [x] The returned UID matches the user's Firebase identity.
- [x] The backend returns the authenticated user's information.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Send a valid Firebase ID token to the protected endpoint | Backend returns the authenticated user's UID | Pass |
| TC-02 | Compare the backend UID with Firebase `localId` | Both identifiers match | Pass |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Firebase UID Verification

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Environment: Personal Windows laptop, Chrome DevTools, Postman, local Express backend
- Endpoint: `GET /api/protected-test`

### Preconditions

- Firebase Authentication is configured.
- Backend Firebase Admin SDK is configured.
- Frontend and backend development servers are running.
- Valid Firebase test-user credentials are available.

### Steps to Reproduce

1. Open the application's login page.
2. Log in using valid Firebase credentials.
3. Open Chrome DevTools and inspect the Firebase `signInWithPassword` response.
4. Identify the Firebase `localId` and ID token.
5. Send `GET /api/protected-test` with the ID token in the Authorization header.
6. Inspect the backend response.
7. Compare the backend's `uid` with Firebase's `localId`.

### Expected Result

- The backend accepts the valid Firebase ID token.
- The backend returns HTTP 200.
- The response contains the authenticated user's UID.
- The returned UID matches Firebase's `localId`.

### Actual Result

- The backend returned HTTP 200.
- The response contained:
  - `status: success`
  - `message: You are authenticated`
  - `uid`: authenticated user's Firebase UID
  - `email`: authenticated user's email address
- The returned UID matched the `localId` observed in the Firebase authentication response.

### Result

**TC-01: Pass**

**TC-02: Pass**

### Bug Reference

None.

### Evidence

- Firebase `signInWithPassword` response inspected in Chrome DevTools.
- Backend JSON response inspected in Postman.
- UID values compared manually and confirmed to match.
- No screenshots or exported response logs recorded.

### Notes

- The matching UID values confirm correct identity extraction for the tested Firebase user.
- This test does not verify Staff/Admin role permissions.
- Firebase ID tokens and user identifiers are not included in this document to avoid exposing authentication information.

## Overall QA Result

**Pass**

Both test cases passed. The backend correctly returned the authenticated user's Firebase UID, matching the identity supplied by Firebase Authentication.

No bugs were identified during this subtask's testing.