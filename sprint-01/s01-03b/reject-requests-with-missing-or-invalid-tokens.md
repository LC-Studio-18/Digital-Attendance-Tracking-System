# ST-04 - Reject Requests with Missing or Invalid Tokens

## Information

- Ticket ID: S1-03b
- Subtask: ST-04 - Reject requests with missing or invalid tokens.
- Assigned developer: Not confirmed
- Current QA status: Pass

## Objective

Verify that the backend rejects unauthenticated requests and requests containing missing, invalid, expired or tampered Firebase ID tokens.

## Acceptance Criteria

- [x] Requests without an authentication token are rejected.
- [x] Requests containing invalid tokens are rejected.
- [x] Requests containing expired tokens are rejected.
- [x] Requests containing tampered tokens are rejected.
- [x] Rejected requests return HTTP 401 Unauthorized.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Access the protected endpoint without an authentication token | HTTP 401 Unauthorized | Pass |
| TC-02 | Access the protected endpoint with an invalid authentication token | HTTP 401 Unauthorized | Pass |
| TC-03 | Access the protected endpoint with an expired Firebase ID token | HTTP 401 Unauthorized | Pass |
| TC-04 | Access the protected endpoint with a tampered Firebase ID token | HTTP 401 Unauthorized | Pass |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Authentication Token Rejection Testing

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Endpoint: `GET /api/protected-test`
- Environment:
  - Work laptop: local backend and API testing client
  - Personal Windows laptop: local Express backend, Postman and curl

### Preconditions

- Backend development server running locally.
- Firebase Admin SDK configured.
- Protected test endpoint available.
- Firebase ID token available for expired-token and tampered-token scenarios.

### Test Execution

#### TC-01 - Missing Authentication Token

**Steps to Reproduce**

1. Send `GET /api/protected-test` without an Authorization header.
2. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- Request is rejected.

**Actual Result**

- HTTP 401 Unauthorized.
- Response message: `Authentication required: missing or malformed Authorization header`.

**Result: Pass**

#### TC-02 - Invalid Authentication Token

**Steps to Reproduce**

1. Send `GET /api/protected-test` with the header:
   `Authorization: Bearer invalid-test-token`
2. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- Invalid token is rejected.

**Actual Result**

- HTTP 401 Unauthorized.
- Response message: `Invalid authentication token`.
- Error code: `auth/argument-error`.

**Result: Pass**

#### TC-03 - Expired Firebase ID Token

**Steps to Reproduce**

1. Obtain an expired Firebase ID token.
2. Send `GET /api/protected-test` using the expired token.
3. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- Expired token is rejected.

**Actual Result**

- HTTP 401 Unauthorized.

**Result: Pass**

**Environment:** Work laptop. This scenario was not repeated on the personal laptop.

#### TC-04 - Tampered Firebase ID Token

**Steps to Reproduce**

1. Obtain a Firebase ID token.
2. Modify one character in the token's signature section.
3. Send the modified token to `GET /api/protected-test`.
4. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- Tampered token is rejected.

**Actual Result**

- HTTP 401 Unauthorized.
- Response message: `Invalid authentication token`.
- Error code: `auth/argument-error`.

**Result: Pass**

### Additional Observations

During invalid-token testing, the Postman VS Code extension returned a missing-header error despite a Bearer token being entered.

The same scenario was subsequently tested using `curl`, which returned the expected invalid-token response.

This is a testing-tool observation, not a confirmed application defect.

### Evidence

- HTTP status codes and JSON responses observed during testing.
- Invalid-token rejection independently verified using `curl`.
- No screenshots or exported API response logs confirmed.
- No authentication tokens or credentials included in this document.

### Notes

- The four rejection scenarios passed against the protected test endpoint.
- The expired-token test was performed on the work laptop.
- Missing, invalid and tampered token tests were performed on the personal laptop.
- These tests do not establish that every protected route has authentication middleware applied.
- Backend Staff/Admin authorization is outside the scope of this subtask.

## Overall QA Result

**Pass**

All four documented token-rejection scenarios passed.

The backend correctly rejected missing, invalid, expired and tampered authentication tokens with HTTP 401 on the tested endpoint.

No confirmed bugs were identified during this subtask's testing.
