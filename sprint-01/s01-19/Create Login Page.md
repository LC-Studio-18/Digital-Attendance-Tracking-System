# ST-01 - Create Login

## Information

- Ticket ID: S1-19
- Assigned developer: Imaan
- Current QA status: Partial Pass - additional verification required

## Objective

- Create a functional login page containing the required authentication form elements.

## Acceptance Criteria

- [✓] Login page renders in the browser.
- [✓] Email input, password input and Login button are displayed.
- [ ] Login page conforms to the approved Figma design.
- [ ] Login page works correctly on mobile and desktop.
- [ ] Successful login navigates to the intended application layout.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Open the login page | Login page renders successfully | Pass |
| TC-02 | Verify required form elements | Email field, password field and Login button are visible | Pass |
| TC-03 | Compare page with approved Figma design | Layout and styling match the approved design | Not Run |
| TC-04 | Verify login page on mobile and desktop | Page remains usable and responsive | Not Run |
| TC-05 | Log in with valid Firebase credentials | Authentication succeeds and user reaches the intended application layout | Partial Pass - login succeeded; destination not verified |

## Linked Bugs

- None confirmed.

## Testing History

### 18 November 2026 - Login page rendering and basic authentication

- Tester: Team 3 QA
- Test case ID: TC-01, TC-02, TC-05
- Branch: `QA3`, testing work from `frontend3-feature/s1-07-admin-controls`
- Commit SHA: Not captured at execution time. Later observed branch tip: `f8564c5`.
- Figma version: Not recorded.
- Environment: Windows, React, Vite, local browser.
- Preconditions: Frontend dependencies installed; development server running. Firebase configuration added before successful authentication testing.

#### Steps to Reproduce

1. Start the frontend development server.
2. Open the application in the browser.
3. Observe the login page and its form elements.
4. Configure Firebase Web app environment variables.
5. Enter valid Firebase credentials and click Login.

#### Expected Result

- Login page renders.
- Email field, password field and Login button are available.
- Valid credentials allow successful authentication and navigation.

#### Actual Result

- Login page rendered successfully.
- Email and password fields and Login button were visible.
- Sign-up, forgot-password and checked Remember Me options were also visible.
- Valid Firebase credentials resulted in a successful login.
- The destination after login was not recorded.

#### Result

TC-01: Pass.

TC-02: Pass.

TC-05: Partial Pass - successful authentication observed; navigation not verified.

TC-03 and TC-04: Not Run.

#### Bug Reference

None.

#### Evidence

- Manual browser observations reported by QA.
- No screenshots or Figma comparison recorded.

#### Notes

- Sign-up and password reset are outside S1-19's scope. Their presence is an observation, not a confirmed defect.
- Design conformity and responsive behaviour remain unverified.
- Exact test commit was not recorded during execution.
