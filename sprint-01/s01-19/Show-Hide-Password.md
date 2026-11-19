# ST-03 - Add Show/Hide Password Option 

## Date Tested: 19 November 2026
## Date Passed: 19 November 2026

## Information

- Ticket ID: S1-19
- Assigned developer: Imaan
- Current QA status: Not Run

## Objective

- Allow users to toggle password visibility without changing the entered password.

## Acceptance Criteria

- [✓] Password is hidden by default.
- [✓] Show-password control reveals the entered password.
- [✓] Hide-password control masks the password again.
- [✓] Toggling visibility preserves the entered value.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Enter a password | Password is masked by default | PASS |
| TC-02 | Activate show-password control | Password becomes visible | PASS |
| TC-03 | Activate hide-password control | Password becomes masked again | PASS |
| TC-04 | Toggle password visibility repeatedly | Entered password remains unchanged | PASS |

## Linked Bugs

- None confirmed.

## Testing History

### 18 November 2026 - Login page observation

- Tester: Team 3 QA
- Test case ID: TC-01 to TC-04
- Branch: `QA3`, testing work from `frontend3-feature/s1-07-admin-controls`
- Commit SHA: Not captured at execution time.
- Environment: Windows, React, Vite, local browser.
- Preconditions: Login page rendered.

#### Steps to Reproduce

1. Open the login page.

2. Enter a password and observe its default visibility.

3. Activate the show-password control.

4. Activate the hide-password control.

5. Confirm the entered password remains unchanged.

#### Expected Result

Password is hidden by default.

Show-password control reveals the password.

Hide-password control masks it again.

Password value is preserved.

#### Actual Result

Password was hidden by default.

Show-password control revealed the password.

Hide-password control masked it again.

Entered password remained unchanged.

#### Result

TC-01: Pass.
TC-02: Pass.
TC-03: Pass.
TC-04: Pass.

Overall functional test result: Pass.

#### Bug Reference

None.

#### Evidence

- Screenshots avaible in Evidence folder of s01-19

#### Notes

- This test can be completed independently of backend authentication.
