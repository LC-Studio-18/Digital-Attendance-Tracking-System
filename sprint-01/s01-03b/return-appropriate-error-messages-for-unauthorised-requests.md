# ST-05 - Return Appropriate Error Messages for Unauthorised Requests

## Information

- Ticket ID: S1-03b
- Subtask: ST-05 - Return appropriate error messages for unauthorised requests.
- Assigned developer: Not confirmed
- Current QA status: Pass

## Objective

Verify that the backend returns appropriate HTTP status codes and understandable error messages when authentication fails.

## Acceptance Criteria

- [x] Missing authentication tokens return HTTP 401.
- [x] Invalid authentication tokens return HTTP 401.
- [x] Tampered authentication tokens return HTTP 401.
- [x] Expired authentication tokens return HTTP 401.
- [x] Authentication failures return appropriate error messages.
- [ ] Verify error handling across all required protected endpoints (ticket-level verification).

## Test Cases

| Test ID | Scenario                                         | Expected Result                               | Status |
| ------- | ------------------------------------------------ | --------------------------------------------- | ------ |
| TC-01   | Request protected endpoint without a token       | HTTP 401 with an authentication error message | Pass   |
| TC-02   | Request protected endpoint with an invalid token | HTTP 401 with an invalid-token error message  | Pass   |
| TC-03   | Request protected endpoint with a tampered token | HTTP 401 with an authentication error message | Pass   |
| TC-04   | Request protected endpoint with an expired token | HTTP 401 with an authentication error message | Pass   |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Backend Authentication Error Handling

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Endpoint: `GET /api/protected-test`
- Environment:
  - Work laptop: local Express backend and Postman.
  - Personal Windows laptop: local Express backend, Postman and curl.

### TC-01 - Missing Authentication Token

**Steps to Reproduce**

1. Send `GET /api/protected-test` without an Authorization header.
2. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- An error message explaining that authentication is required.

**Actual Result**

- HTTP 401 Unauthorized.
- Response message: `Authentication required: missing or malformed Authorization header`.

**Result: Pass**

### TC-02 - Invalid Authentication Token

**Steps to Reproduce**

1. Send `GET /api/protected-test` with the header:
   `Authorization: Bearer invalid-test-token`
2. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- An error message indicating that the authentication token is invalid.

**Actual Result**

- HTTP 401 Unauthorized.
- Response message: `Invalid authentication token`.
- Error code: `auth/argument-error`.

**Result: Pass**

### TC-03 - Tampered Authentication Token

**Steps to Reproduce**

1. Obtain a valid Firebase ID token.
2. Modify one character in the token's signature section.
3. Send the modified token to `GET /api/protected-test`.
4. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- An authentication error message.

**Actual Result**

- HTTP 401 Unauthorized.
- Response message: `Invalid authentication token`.
- Error code: `auth/argument-error`.

**Result: Pass**

### TC-04 - Expired Authentication Token

**Steps to Reproduce**

1. Obtain an expired Firebase ID token.
2. Send `GET /api/protected-test` using the expired token in Postman.
3. Inspect the HTTP response.

**Expected Result**

- HTTP 401 Unauthorized.
- An appropriate authentication error message.

**Actual Result**

- HTTP 401 Unauthorized.
- Appropriate authentication error response observed in Postman.
- Exact error message was not retained in the QA notes.

**Result: Pass**

**Environment:** Work laptop.

**Evidence limitation:** The tester confirmed that the expected error response was observed, but its exact wording was not recorded. This does not change the observed Pass result.

## Additional Observations

During invalid-token testing, the Postman VS Code extension appeared not to transmit the Authorization header correctly.

The same scenario was subsequently tested using `curl`, which returned the expected invalid-token response.

This is recorded as a testing-tool observation, not a confirmed backend defect.

## Evidence

- HTTP status codes and JSON responses observed during manual API testing.
- Missing-token, invalid-token and tampered-token error messages recorded.
- Expired-token HTTP 401 and appropriate error response confirmed by the tester.
- Exact expired-token error message not retained.
- No saved screenshots or exported API response logs confirmed.
- No authentication tokens or credentials included in this document.

## Notes

- All four documented error-handling scenarios passed against `/api/protected-test`.
- The expired-token test was performed on the work laptop.
- The invalid-token scenario was independently verified using `curl` on the personal laptop.
- These results do not establish that every protected API endpoint handles authentication errors correctly.
- Staff/Admin authorization errors (HTTP 403) are outside this subtask's tested scope.

## Outstanding Ticket-Level Verification

- Verify error handling across the remaining protected API endpoints.
- Confirm that error responses do not expose sensitive information.
- Capture exact error-response details during future regression testing where practical.

## Overall QA Result

**Pass — 4/4 test cases passed.**

The backend returned HTTP 401 with appropriate authentication error responses for missing, invalid, tampered and expired Firebase ID tokens on the tested endpoint.

No confirmed bugs were identified during this subtask's testing.

**ST-05 is marked Pass for the tested authentication error-handling functionality.** Broader endpoint coverage remains outstanding at ticket level.
