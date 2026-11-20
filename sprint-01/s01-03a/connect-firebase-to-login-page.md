# ST-02 - Connect Firebase to the Login Page

## Information

- Ticket ID: S1-03a
- Subtask: ST-02 - Connect Firebase to the Login Page
- Assigned developer: Imaan
- Current QA status: Partial Pass - application session verification still required

## Objective

Connect Firebase Authentication to the login page so users can authenticate with their Firebase credentials.

## Acceptance Criteria

- [x] A user with valid Firebase credentials can log in successfully.
- [x] Confirm that the login page authenticates through the intended Firebase integration.
- [ ] Confirm successful authentication establishes the expected application session.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Open the login page with Firebase configuration missing | Application communicates that Firebase setup is incomplete | Pass |
| TC-02 | Configure Firebase and log in with valid credentials | Authentication succeeds | Pass |
| TC-03 | Verify the Firebase authentication request | Firebase authenticates the intended user and returns an ID token | Pass |
| TC-04 | Verify the authenticated application session | The application establishes the expected authenticated session | Not fully verified |

## Linked Bugs

- None confirmed for this subtask.

## Testing History

### 18 November 2026 - Local Firebase Configuration and Login Testing

- Tester: Team 3 QA
- Test case IDs: TC-01, TC-02
- Branch: `QA3`, testing work from `frontend3-feature/s1-07-admin-controls`
- Commit SHA: Not captured at execution time. Later observed branch tip: `f8564c5`.
- Environment: Windows, Git Bash, React, Vite, local development server.
- Preconditions: Frontend dependencies installed and application running locally.

#### Steps to Reproduce

1. Open the login page without a configured `frontend/.env` file.
2. Observe the Firebase configuration warning.
3. Create the local `.env` file using `.env.example` and supply the required Firebase Web app configuration.
4. Restart the development server.
5. Enter credentials for an existing Firebase user.
6. Click Login.

#### Expected Result

- Missing Firebase configuration is identified.
- With valid configuration and credentials, authentication succeeds.

#### Actual Result

- Initially, the application displayed: "Firebase setup is incomplete. Add the Web app values to frontend/.env and restart the app."
- The Login button was unavailable.
- After configuring Firebase, the warning disappeared and the button became usable.
- Login succeeded using credentials belonging to an existing Firebase user.

#### Result

- TC-01: Pass
- TC-02: Pass

#### Bug Reference

None.

#### Evidence

- Manual browser observations reported by QA.
- No screenshots, network traces or Firebase authentication logs recorded.

#### Notes

- Missing local Firebase configuration was an environment blocker that was resolved.
- Successful login supported the Firebase integration requirement, but token handling and session state had not yet been independently inspected.
- The exact commit tested must be verified before attributing the result to a specific revision.

---

### 19 November 2026 - Firebase Authentication Request Verification

- Tester: Team 3 QA
- Test case ID: TC-03
- Branch: `QA3`
- Commit SHA: Not captured at execution time.
- Environment: Personal Windows laptop, React/Vite frontend, Chrome DevTools, local development environment.
- Preconditions:
  - Firebase Web app configuration available in `frontend/.env`.
  - Frontend development server running.
  - Valid Firebase test-user credentials available.

#### Steps to Reproduce

1. Start the React frontend locally.
2. Open the application's login page in Chrome.
3. Open Chrome DevTools and navigate to the Network tab.
4. Log in using valid Firebase credentials.
5. Locate the Firebase `signInWithPassword` network response.
6. Inspect the response for authentication information.

#### Expected Result

- The login page communicates with Firebase Authentication.
- Firebase accepts valid credentials.
- Firebase returns authentication information for the intended user.

#### Actual Result

- The Firebase `signInWithPassword` response was inspected.
- The response contained a Firebase ID token.
- The response contained a `localId` identifying the authenticated Firebase user.
- Authentication succeeded.

#### Result

**TC-03: Pass**

The observed Firebase response confirms that the authentication request reached Firebase and returned authentication information.

#### Bug Reference

None.

#### Evidence

- Firebase `signInWithPassword` response inspected in Chrome DevTools.
- Firebase ID token and `localId` observed.
- No saved screenshot or exported network trace recorded.

#### Notes

- The Firebase ID token was also used during separate backend authentication testing under S1-03b.
- This test does not prove that the frontend automatically attaches Firebase tokens to backend API requests.
- Automatic token transmission belongs to S1-03a ST-08.
- Firebase ID tokens must not be copied into QA documentation.

---

## Outstanding Verification

### TC-04 - Authenticated Application Session

**Status: Not fully verified under this subtask**

The application session still needs to be explicitly checked against the intended session behaviour and recorded with sufficient evidence.

Related testing of session persistence and logout was performed separately, but those results should be documented under their respective S1-03a subtasks.

## Overall QA Result

**Partial Pass**

The following behaviours have been verified:

- Missing Firebase configuration produces a warning.
- Valid Firebase credentials allow successful login.
- The login page communicates with Firebase Authentication.
- Firebase returns an ID token and identifies the authenticated user.

Remaining verification:

- Confirm and document the expected authenticated application session.

**No confirmed bugs were identified during the tests recorded in this document.**