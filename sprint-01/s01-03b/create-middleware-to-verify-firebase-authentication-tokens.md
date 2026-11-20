# ST-02 - Create Middleware to Verify Firebase Authentication Tokens

## Information

- Ticket ID: S1-03b
- Subtask: ST-02 - Create middleware to verify Firebase authentication tokens.
- Assigned developer: Not confirmed
- Current QA status: Partial Pass - tested endpoint verified

## Objective

Verify that the backend authentication middleware accepts valid Firebase ID tokens and rejects requests with missing, invalid, expired or tampered tokens.

## Acceptance Criteria

- [x] A valid Firebase ID token is accepted.
- [x] Missing tokens are rejected with HTTP 401.
- [x] Invalid tokens are rejected with HTTP 401.
- [x] Expired tokens are rejected with HTTP 401.
- [x] Tampered tokens are rejected with HTTP 401.
- [ ] Confirm authentication middleware protects all required API routes.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Request protected endpoint without a token | HTTP 401 | Pass |
| TC-02 | Request protected endpoint with an invalid token | HTTP 401 | Pass |
| TC-03 | Request protected endpoint with a valid Firebase ID token | HTTP 200 | Pass |
| TC-04 | Request protected endpoint with a tampered token | HTTP 401 | Pass |
| TC-05 | Request protected endpoint with an expired token | HTTP 401 | Pass |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Firebase Authentication Middleware Testing

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Endpoint: `GET /api/protected-test`
- Environment:
  - Work laptop: local backend and API testing client
  - Personal Windows laptop: local Express backend, Postman and curl
- Preconditions:
  - Backend development server running
  - Firebase Admin SDK configured
  - Valid Firebase test-user credentials available

### Test Execution

#### TC-01 - Missing Token

**Steps**

1. Send `GET /api/protected-test` without an Authorization header.
2. Inspect the response.

**Expected:** HTTP 401.

**Actual:** HTTP 401 with a message indicating the Authorization header was missing or malformed.

**Result: Pass**

#### TC-02 - Invalid Token

**Steps**

1. Send `GET /api/protected-test` with `Authorization: Bearer invalid-test-token`.
2. Inspect the response.

**Expected:** HTTP 401.

**Actual:** HTTP 401 with `Invalid authentication token` and error code `auth/argument-error`.

**Result: Pass**

#### TC-03 - Valid Token

**Steps**

1. Log in through Firebase Authentication.
2. Obtain the Firebase ID token from the authentication response.
3. Send `GET /api/protected-test` with the token in the Authorization header.
4. Inspect the response.

**Expected:** HTTP 200 and authenticated user information.

**Actual:** HTTP 200 with success status, authenticated user's UID and email.

**Result: Pass**

#### TC-04 - Tampered Token

**Steps**

1. Obtain a Firebase ID token.
2. Modify one character in the token's signature section.
3. Send the modified token to the protected endpoint.
4. Inspect the response.

**Expected:** HTTP 401.

**Actual:** HTTP 401 with `Invalid authentication token` and error code `auth/argument-error`.

**Result: Pass**

#### TC-05 - Expired Token

**Steps**

1. Obtain an expired Firebase ID token.
2. Send it to the protected endpoint.
3. Inspect the response.

**Expected:** HTTP 401.

**Actual:** HTTP 401.

**Result: Pass**

**Environment:** Work laptop. This test was not repeated on the personal laptop.

## Additional Observations

During invalid-token testing, the Postman VS Code extension returned a missing-header error despite the Bearer token being entered.

The same scenario was subsequently tested using `curl`, which returned the expected invalid-token response.

This is recorded as a testing-tool observation, not a confirmed backend defect.

## Evidence

- HTTP response codes and JSON responses observed during execution.
- Firebase authentication response inspected in Chrome DevTools.
- No saved screenshots or exported API response logs confirmed.
- Authentication tokens and credentials are excluded from this document.

## Outstanding Verification

- Verify middleware enforcement across the remaining protected API routes.
- Confirm frontend requests automatically include Firebase ID tokens under S1-03a ST-08.
- Complete integration verification when the relevant frontend work is ready.

## Overall QA Result

**Partial Pass**

All five documented authentication scenarios passed against the protected test endpoint.

No confirmed backend authentication middleware bugs were identified during these tests.

The middleware has not yet been verified across every required protected API route.