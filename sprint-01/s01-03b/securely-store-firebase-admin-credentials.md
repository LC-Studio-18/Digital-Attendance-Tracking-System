# ST-07 - Securely Store Firebase Admin Credentials

## Information

- Ticket ID: S1-03b
- Subtask: ST-07 - Securely store Firebase Admin credentials.
- Assigned developer: Not confirmed
- Current QA status: Partial Pass - credential security verification outstanding

## Objective

Verify that Firebase Admin credentials are stored securely, are not exposed through the frontend, and are not committed to the shared Git repository.

## Acceptance Criteria

- [x] Backend can access the required Firebase configuration locally.
- [ ] Firebase Admin credentials are stored outside tracked source code.
- [ ] Backend `.env` is excluded from Git tracking.
- [ ] No Firebase private keys or service-account credentials are committed to the repository.
- [ ] Firebase Admin credentials are not exposed through frontend code or API responses.
- [ ] Backend `.env.example` contains placeholders rather than real credentials.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Start the backend with locally configured Firebase credentials | Backend starts and can verify Firebase tokens | Pass |
| TC-02 | Check whether backend `.env` is tracked by Git | File is not tracked | Not Run |
| TC-03 | Inspect tracked files for Firebase Admin secrets | No private keys or service-account secrets are committed | Not Run |
| TC-04 | Inspect backend `.env.example` | Contains placeholders, not actual credentials | Not Run |
| TC-05 | Check frontend code for Firebase Admin credentials | No backend private keys or service-account credentials are exposed | Not Run |

## Linked Bugs

- None confirmed.

## Testing History

### 19 November 2026 - Local Firebase Credential Configuration

- Tester: Team 3 QA
- Branch: `QA3`
- Commit SHA: Not captured
- Environment: Personal Windows laptop, Node.js, Express, Firebase Admin SDK, local backend environment.
- Endpoint: `GET /api/protected-test`

### TC-01 - Backend Credential Configuration

**Steps to Reproduce**

1. Configure the local backend environment using the required Firebase Admin settings.
2. Start the backend using `npm run dev`.
3. Obtain a valid Firebase ID token through Firebase Authentication.
4. Send the token to the protected backend endpoint.
5. Inspect the response.

**Expected Result**

- Backend starts successfully.
- Firebase Admin SDK can verify the supplied ID token.
- Protected endpoint returns HTTP 200.

**Actual Result**

- Backend started successfully.
- Backend accepted a valid Firebase ID token.
- Protected endpoint returned HTTP 200 with authenticated user information.

**Result: Pass**

### TC-02 - Git Tracking Verification

**Expected Result**

The backend `.env` file is not tracked by Git.

**Actual Result**

Not tested.

**Result: Not Run**

### TC-03 - Repository Secret Inspection

**Expected Result**

No Firebase Admin private keys or service-account secrets are committed to tracked repository files.

**Actual Result**

Not tested.

**Result: Not Run**

### TC-04 - Environment Example Review

**Expected Result**

The backend `.env.example` contains placeholder configuration values rather than real credentials.

**Actual Result**

Not tested.

**Result: Not Run**

### TC-05 - Frontend Credential Exposure

**Expected Result**

Firebase Admin private keys and service-account credentials are not exposed through frontend source code.

**Actual Result**

Not tested.

**Result: Not Run**

## Evidence

- Local backend started successfully with configured environment variables.
- Valid Firebase ID token was accepted by the backend.
- HTTP 200 response observed from the protected endpoint.
- No repository secret-scan results or Git tracking checks recorded.
- No credentials or private keys included in this document.

## Notes

- Successful backend authentication confirms that the configured credentials work in the local environment.
- It does not establish that credentials are stored securely.
- Firebase Web app configuration and Firebase Admin credentials are different. Firebase Web app configuration is intended for frontend use; Firebase Admin private keys must remain server-side.
- The absence of observed credential exposure is not evidence that no exposure exists.
- No credential-security defect has been confirmed, but the relevant security checks remain outstanding.

## Outstanding Verification

- Verify that `backend/.env` is not tracked by Git.
- Inspect tracked repository files for committed credentials.
- Review `.env.example` for sensitive values.
- Confirm Firebase Admin credentials are not included in frontend code.
- Check that API responses do not expose backend credentials.

## Overall QA Result

**Partial Pass — 1/5 test cases passed; 4 not run.**

The backend successfully used its local Firebase configuration to authenticate a valid user.

Credential storage security has not yet been verified.

**ST-07 must not be marked fully passed until the outstanding security checks are completed.**