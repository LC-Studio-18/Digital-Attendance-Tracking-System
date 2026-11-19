# ST-06 - Show Error Messages

## Information

- Ticket ID: S1-19
- Assigned developer: Imaan
- Current QA status: Partial Pass - offline error handling not tested

## Objective

- Display clear, understandable messages when login attempts fail.

## Acceptance Criteria

- [x] Incorrect login credentials display a clear error message.
- [ ] No internet connection displays an appropriate error message.
- [ ] Error messages do not expose sensitive authentication details.
- [ ] Users can retry after an authentication error.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Log in with incorrect credentials | Clear authentication error is displayed | Pass |
| TC-02 | Attempt login while offline | Clear connection error is displayed | Not Run |
| TC-03 | Inspect authentication errors | No sensitive technical details are exposed | Not Run |
| TC-04 | Retry after an incorrect-credentials error | User can attempt login again | Not Run |

## Linked Bugs

- None confirmed.

## Testing History

### 18 November 2026 - Incorrect login credentials

- Tester: Team 3 QA
- Test case ID: TC-01
- Branch: `QA3`, testing work from `frontend3-feature/s1-07-admin-controls`
- Commit SHA: Not captured at execution time.
- Environment: Windows, React, Vite, local browser.
- Preconditions: Firebase configured and login page accessible.

#### Steps to Reproduce

1. Open the login page.
2. Enter a random email address and password.
3. Click Login.
4. Observe the error message.

#### Expected Result

- Login is rejected with a clear, understandable error.

#### Actual Result

- Application displayed: "Email or password is incorrect."

#### Result

TC-01: Pass.

TC-02 to TC-04: Not Run.

#### Bug Reference

None.

#### Evidence

- Manual browser observation reported by QA.
- No screenshot or network trace recorded.

#### Notes

- Incorrect-credentials error handling was observed.
- Offline behaviour remains untested.
- This overlaps with S1-03a ST-07. The same observation can be referenced in both reports without repeating the test execution.
