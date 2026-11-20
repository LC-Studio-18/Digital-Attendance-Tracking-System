# ST-06 - Create a Protected Test API Endpoint

## Information

- Ticket ID: S1-03b
- Subtask: ST-06 - Create a protected test API endpoint.
- Assigned developer: Not confirmed
- Current QA status: Pass

## Objective

Verify that the backend provides a protected test API endpoint that allows authenticated Firebase users to access it while rejecting unauthenticated requests.

## Acceptance Criteria

- [x] A protected test API endpoint exists and responds to requests.
- [x] Requests without an authentication token return HTTP 401 Unauthorized.
- [x] Requests with invalid authentication tokens return HTTP 401 Unauthorized.
- [x] Requests with valid Firebase ID tokens return HTTP 200 OK.
- [x] Successful responses contain the authenticated user's information.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Access the protected test endpoint without an authentication token | HTTP 401 Unauthorized | Pass |
| TC-02 | Access the protected test endpoint with an invalid token | HTTP 401 Unauthorized | Pass |
| TC-03 | Access the protected test endpoint with a valid Firebase ID token | HTTP 200 OK and authenticated user information | Pass |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Protected Test Endpoint Verification

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Endpoint: `GET http://127.0.0.1:5000/api/protected-test`
- Environment:
  - Personal Windows laptop
  - Node.js / Express backend running locally
  - Postman and curl
  - Firebase Authentication

### Preconditions

- Backend dependencies installed.
- Backend development server running on port 5000.
- Firebase Admin SDK configured.
- A valid Firebase test-user account available.
- A valid Firebase ID token obtained through authentication.

### TC-01 - Missing Authentication Token

**Steps to Reproduce**

1. Start the backend development server.
2. Send `GET /api/protected-test` without an Authorization header.
3. Inspect the response.

**Expected Result**

- HTTP 401 Unauthorized.
- The endpoint rejects unauthenticated access.

**Actual Result**

- HTTP 401 Unauthorized.
- Response:

```json
{
  "status": "error",
  "message": "Authentication required: missing or malformed Authorization header"
}
```

**Result: Pass**

### TC-02 - Invalid Authentication Token

**Steps to Reproduce**

1. Send `GET /api/protected-test` with the header:

   `Authorization: Bearer invalid-test-token`

2. Inspect the response.

**Expected Result**

- HTTP 401 Unauthorized.
- The endpoint rejects invalid authentication tokens.

**Actual Result**

- HTTP 401 Unauthorized.
- Response:

```json
{
  "status": "error",
  "message": "Invalid authentication token",
  "code": "auth/argument-error"
}
```

**Result: Pass**

### TC-03 - Valid Firebase ID Token

**Steps to Reproduce**

1. Log in using valid Firebase credentials.
2. Open Chrome DevTools and inspect the Firebase `signInWithPassword` response.
3. Obtain the Firebase ID token.
4. In Postman, send `GET /api/protected-test` with the token in the Authorization header.
5. Inspect the response.

**Expected Result**

- HTTP 200 OK.
- The backend recognises the authenticated user.
- The response contains the user's Firebase UID and email.

**Actual Result**

- HTTP 200 OK.
- Response contained:

```json
{
  "status": "success",
  "message": "You are authenticated",
  "uid": "[redacted]",
  "email": "[redacted]"
}
```

- The backend successfully returned the authenticated user's information.

**Result: Pass**

## Additional Observations

During invalid-token testing, the Postman VS Code extension returned a missing-header error despite a Bearer token being entered.

The same test was repeated using `curl`, which returned the expected invalid-token response.

This observation does not establish a backend defect.

## Evidence

- HTTP responses inspected during manual API testing.
- Valid Firebase ID token obtained from the Firebase authentication response.
- Protected endpoint returned the authenticated user's UID and email.
- Missing and invalid token requests returned HTTP 401.
- No saved screenshots or exported response logs confirmed.
- Authentication tokens and personal identifiers are excluded from this document.

## Notes

- The protected test endpoint successfully demonstrated Firebase authentication enforcement.
- The endpoint was tested using valid, missing and invalid authentication tokens.
- Expired and tampered token rejection were documented separately under ST-04.
- This test does not verify Staff/Admin role-based authorization.
- This test does not establish that authentication middleware is applied to every production API route.
- Manual token submission does not verify automatic frontend-to-backend token transmission.

## Overall QA Result

**Pass — 3/3 test cases passed.**

The protected test API endpoint correctly accepted a valid Firebase ID token and rejected requests with missing or invalid tokens.

The backend returned the authenticated user's information when a valid token was supplied.

No confirmed bugs were identified during this subtask's testing.