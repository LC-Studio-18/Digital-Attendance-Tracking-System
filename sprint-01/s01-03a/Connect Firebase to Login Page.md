# ST-02 - Connect Firebase to the Login Page

## Information

- Ticket ID: S1-03a
- Assigned developer: Imaan
- Current QA status: Partial Pass - additional integration verification required

## Objective

- Connect Firebase Authentication to the login page so users can authenticate with their Firebase credentials.

## Acceptance Criteria

- [✓] A user with valid Firebase credentials can log in successfully.
- [ ] Confirm that the login page authenticates through the intended Firebase integration.
- [ ] Confirm successful authentication establishes the expected application session.

## Test Cases

| Test ID | Scenario                                                | Expected Result                                            | Status          |
|---------|---------------------------------------------------------|------------------------------------------------------------|-----------------|
| TC-01   | Open the login page with Firebase configuration missing | Application communicates that Firebase setup is incomplete | Pass - observed |
| TC-02   | Configure Firebase and log in with valid credentials    | Authentication succeeds                                    | Pass - observed |
| TC-03   | Verify Firebase authentication request and session state| Firebase integration authenticates the intended user       | Not Run         |

## Linked Bugs

- None confirmed.

## Testing History

### 18 November 2026 - Local Firebase configuration and login testing

- Tester: Team 3 QA
- Test case ID: TC-01, TC-02, TC-03
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

TC-01: Pass - configuration warning observed.

TC-02: Pass - successful login observed.

TC-03: Not Run - Firebase request details and authenticated session state were not independently inspected.

#### Bug Reference

None.

#### Evidence

- Manual browser observations reported by QA.
- No screenshots, network traces or Firebase authentication logs recorded.

#### Notes

- Missing local Firebase configuration was an environment blocker that was resolved.
- Successful login supports the Firebase integration requirement but does not establish token handling, persistence or backend verification.
- The exact commit tested must be verified before attributing the result to a specific revision.
