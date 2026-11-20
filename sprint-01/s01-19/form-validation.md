# ST-04 - Add Form Validation with Messages

## Information

- Ticket ID: S1-19
- Assigned developer: Imaan
- Current QA status: Partial Pass - additional validation testing required

## Objective

- Validate required login fields and email format before submitting authentication requests.

## Acceptance Criteria

- [✓] Empty email and password fields produce a validation message.
- [✓] Missing email produces an appropriate validation message.
- [✓] Missing password produces an appropriate validation message.
- [✓] Invalid email formats produce validation messages.
- [] Invalid form submissions are prevented before an authentication request is sent.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Submit both fields empty | Required-fields validation message appears | Pass |
| TC-02 | Submit with email empty and password populated | Email-required message appears | Pass |
| TC-03 | Submit with password empty and email populated | Password-required message appears | Pass |
| TC-04 | Submit an invalid email format | Email-format validation message appears | Pass |
| TC-05 | Inspect Network tab during invalid submission | No authentication request is sent | Fail |

## Linked Bugs

- None confirmed.

## Testing History

### 18 November 2026 - Empty-field validation

- Tester: Team 3 QA
- Test case ID: TC-01
- Branch: `QA3`, testing work from `frontend3-feature/s1-07-admin-controls`
- Commit SHA: Not captured at execution time.
- Environment: Windows, React, Vite, local browser.
- Preconditions: Firebase Web app configuration completed and Login button available.

#### Steps to Reproduce

1. Open the login page.
2. Leave the email and password fields empty.
3. Click Login.
4. Observe the validation message.

#### Expected Result

- Required-fields validation message is displayed.
- Authentication request is not sent.

#### Actual Result

- Application displayed: "Please enter your email address and password."
- Whether an authentication request was sent was not checked.

#### Result

TC-01: Pass - validation message observed.

TC-02 to TC-05: Not Run.

#### Bug Reference

None.

#### Evidence

- Manual browser observation reported by QA.
- No Network-tab evidence or screenshot recorded.

#### Notes

- Displaying the message does not prove that submission was prevented.
- Network inspection is required to verify the acceptance criterion that validation occurs before anything is sent.
