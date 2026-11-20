# ST-06 - Error Messages

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah.
- Current QA status: Fail by source review; runtime failure test Not Run because there is no request/failure path to exercise.

## Acceptance Criteria
- [ ] Failed clock-out shows clear error feedback and allows recovery.

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Cause clock-out operation failure | Clear error appears; status remains unchanged and retry is possible | Fail by source review (no handling); runtime test Not Run |

## Objective
- Show useful error feedback when clock-out fails.

## Acceptance Criteria
- [ ] A failed clock-out shows clear error feedback.

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Cause clock-out request failure | Clear error feedback appears | Not Run |

## Linked Bugs
None recorded.

## Testing History
### 18 November 2026 - Review status
- Tester: Adam Jattiem. Commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Clock-out error feedback is not implemented in the reviewed commit. Test not run; no result is claimed.

#### Additional history fields
- Test case ID: TC-01.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; browser and device not recorded.
- Preconditions: Error feedback not implemented in reviewed commit.

#### Steps to Reproduce
1. No runtime test steps were performed.

#### Expected Result
- A failed clock-out shows clear error feedback.

#### Actual Result
- Clock-out error feedback not implemented in reviewed commit.

#### Result
- TC-01 Not Run.

#### Bug Reference
- None recorded.

#### Evidence
- Static review; no runtime evidence recorded.

#### Notes
- Run error tests after implementation and integration.


### 19-20 November 2026 - Source review
- Supplied source findings show no error handling and no API request/failure mechanism. No runtime failure was triggered. Expected: clear feedback, unchanged status and retry. Actual: functionality absent by source review; runtime result is Not Run. Track under BUG-S1-10a-07; absence of a test mechanism is not an application runtime failure.
- Prepared feedback, not sent: Elijah to implement clear error feedback, keep status unchanged on failure, allow retry, and use `try/catch/finally` where appropriate. QA will inject a failure and check message, state and retry after implementation.
