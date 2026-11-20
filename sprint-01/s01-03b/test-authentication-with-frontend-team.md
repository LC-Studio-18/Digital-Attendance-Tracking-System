# ST-08 - Test Authentication with the Frontend Team

## Information

- Ticket ID: S1-03b
- Subtask: ST-08 - Test authentication with the frontend team.
- Assigned developer: Not confirmed
- Current QA status: Partial Pass - frontend/backend integration verification outstanding

## Objective

Verify that Firebase authentication works between the React frontend and Express backend, including token generation, transmission and backend verification.

## Acceptance Criteria

- [x] Firebase Authentication successfully issues an ID token following login.
- [x] The backend accepts a valid Firebase ID token obtained through frontend login.
- [x] The backend correctly identifies the authenticated Firebase user.
- [ ] The frontend automatically sends Firebase ID tokens with protected backend requests.
- [ ] The backend successfully authenticates a protected request initiated by the frontend.
- [ ] Complete and record authentication integration testing with the frontend team.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Log in through the frontend and inspect the Firebase authentication response | Firebase returns a valid ID token | Pass |
| TC-02 | Manually send the Firebase ID token to the protected backend endpoint | Backend accepts the token and returns HTTP 200 | Pass |
| TC-03 | Compare the Firebase user identity with the backend response | Backend UID matches Firebase `localId` | Pass |
| TC-04 | Trigger a protected backend request from the frontend | Frontend automatically includes the Firebase ID token | Blocked |
| TC-05 | Verify backend authentication of a frontend-initiated request | Backend accepts the request and returns the expected authenticated response | Blocked |
| TC-06 | Verify integration with the frontend development team | Joint integration test is completed and recorded | Not Run |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Firebase Frontend/Backend Authentication Testing

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Environment:
  - Personal Windows laptop
  - React frontend running locally with Vite
  - Node.js / Express backend running locally
  - Chrome DevTools
  - Postman
- Backend endpoint: `GET http://127.0.0.1:5000/api/protected-test`

### Preconditions

- Frontend Firebase configuration is available.
- Backend Firebase Admin SDK is configured.
- Frontend and backend development servers are running.
- Valid Firebase test-user credentials are available.
- Protected backend test endpoint is accessible.

### TC-01 - Obtain Firebase ID Token Through Frontend Login

**Steps to Reproduce**

1. Open the application's login page.
2. Open Chrome DevTools and select the Network tab.
3. Log in using valid Firebase credentials.
4. Locate the Firebase `signInWithPassword` response.
5. Inspect the authentication response.

**Expected Result**

- Firebase authenticates the user.
- Firebase returns an ID token.

**Actual Result**

- Login succeeded.
- The Firebase authentication response contained an `idToken`.
- The response also contained the authenticated user's `localId`.

**Result: Pass**

### TC-02 - Verify Firebase Token with Backend

**Steps to Reproduce**

1. Obtain the Firebase ID token from the frontend login response.
2. Open Postman.
3. Send `GET /api/protected-test` with the header:

   `Authorization: Bearer [Firebase ID token]`

4. Inspect the backend response.

**Expected Result**

- Backend accepts the Firebase ID token.
- HTTP 200 OK is returned.
- Authenticated user information is returned.

**Actual Result**

- Backend returned HTTP 200 OK.
- Response contained:
  - `status: success`
  - `message: You are authenticated`
  - `uid`: authenticated user's Firebase UID
  - `email`: authenticated user's email address

**Result: Pass**

### TC-03 - Verify Authenticated User Identity

**Steps to Reproduce**

1. Inspect the Firebase `signInWithPassword` response.
2. Record the `localId` for comparison without storing it in the documentation.
3. Inspect the backend's authenticated response.
4. Compare the returned `uid` with Firebase's `localId`.

**Expected Result**

The backend UID matches the Firebase user identity.

**Actual Result**

The two identifiers matched.

**Result: Pass**

### TC-04 - Automatic Firebase Token Transmission

**Expected Result**

The frontend automatically attaches the Firebase ID token to protected backend API requests.

**Actual Result**

- The existing `apiClient.js` implementation was inspected.
- An Axios request interceptor intended to attach Firebase ID tokens was identified.
- No successfully executed frontend-initiated protected request was verified.
- Inspection of a pending developer-branch merge identified a `/auth/check-email` request, but no frontend call site for the associated function was found.
- The pending merge was aborted without committing changes to `QA3`.

**Result: Blocked**

**Reason:** No suitable integrated frontend request was available for runtime verification in the tested code.

### TC-05 - Backend Verification of Frontend-Initiated Request

**Expected Result**

A protected request initiated by the frontend reaches the backend with a valid Firebase ID token and receives the expected authenticated response.

**Actual Result**

Not verified.

The successful Postman request in TC-02 demonstrates manual token transmission, not automatic frontend/backend integration.

**Result: Blocked**

### TC-06 - Integration Testing with Frontend Team

**Expected Result**

Authentication integration is tested with the frontend developers, and the results are recorded.

**Actual Result**

No completed joint integration test session has been confirmed in the QA evidence.

**Result: Not Run**

## Additional Observations

The frontend API client contains an Axios interceptor designed to retrieve a Firebase ID token and attach it to outgoing requests when a token is available.

However, the existence of this code does not prove that the frontend successfully transmits tokens during actual protected API requests.

A developer feature branch was inspected during the investigation. Its changes were not committed to the QA branch.

No application defect was confirmed from this inspection.

## Evidence

- Firebase `signInWithPassword` response inspected in Chrome DevTools.
- Firebase ID token obtained through frontend login.
- Valid token manually submitted to the backend through Postman.
- Backend returned HTTP 200 with authenticated user information.
- Firebase `localId` and backend `uid` compared and confirmed to match.
- Frontend API client and developer-branch integration code inspected.
- No saved network traces or joint integration test records confirmed.
- No authentication tokens or credentials included in this document.

## Notes

- TC-01 through TC-03 confirm that the frontend can obtain a Firebase token and the backend can independently verify it.
- Manual submission of a token through Postman is not equivalent to automatic token transmission by the frontend.
- Automatic token transmission is also an acceptance criterion of S1-03a.
- No confirmed frontend/backend integration bug has been identified.
- Further testing depends on an integrated frontend request being available and ready for QA.

## Outstanding Verification

- Execute a protected API request directly from the frontend.
- Confirm that the outgoing request includes the Firebase ID token.
- Verify that the backend authenticates the frontend-initiated request.
- Coordinate and record integration testing with the frontend developers.

## Overall QA Result

**Partial Pass — 3/6 test cases passed, 2 blocked, 1 not run.**

The frontend successfully obtained a Firebase ID token, and the backend successfully verified that token when it was submitted manually through Postman.

Automatic frontend-to-backend token transmission remains unverified.

**ST-08 must not be marked fully passed until the outstanding integration tests are completed.**