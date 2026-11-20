# ST-06 - Error Messages

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah.
- Current QA status: Fail by source review: error handling missing. Runtime failure, state preservation and retry checks 6.1-6.3 were Blocked.

## Objective
- Show useful feedback when clock-out fails.

## Acceptance Criteria
- [ ] See original ticket acceptance criteria and Definition of Done in [S1-10a README](README.md).

## Test Cases

| Test ID | Scenario | Expected Result | Primary Status and Notes |
|---|---|---|---|
| TC-01 | Cause clock-out operation failure | Show error feedback, preserve status and allow retry | Fail - source review confirms handling absent; runtime failure test not run. |

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


### 20 November 2026 - Zaarah Okkers retest
- Tester: Zaarah Okkers; tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Dummy-data frontend only; authentication and API connectivity were not tested.
- Fail by source review: error handling missing. Runtime failure, state preservation and retry checks 6.1-6.3 were Blocked.
- Evidence: supplied tester report; session screenshots/logs pending. See [complete session](2026-11-20-zaarah-testing.md). Real integration is mandatory for S1-10a approval.
