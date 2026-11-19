# ST-04 - Check that the employee is currently clocked in

## Information
- Ticket ID: S1-10b
- Assigned developer: Khanya Gcilitshane
- Slack record: `Rec0CGNCLA4SZ` (saved tracker export; not live verification).
- Current QA status: Pass at demo level

## Objective
- Allow clock-out only when the employee is currently IN.

## Acceptance Criteria
- [x] IN employees can clock out; employees without a prior clock-in are rejected.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| A01, A04, M01, M03 | Allow clock-out only when the employee is currently IN. | IN employees can clock out; employees without a prior clock-in are rejected. | Pass |

The status above applies only to the stated test scope. Outstanding checks: N03; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: A01, A04, M01, M03.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. For blocked checks, the required integration is unavailable.

#### Steps to Reproduce
1. Run service tests for IN and no prior clock-in; send first demo requests for UIDs 001 and 002.
2. Compare the observed result with the expected result and review the linked evidence.

#### Expected Result
- IN employees can clock out; employees without a prior clock-in are rejected.

#### Actual Result
- Service tests passed; no prior clock-in returned 409. Both first demo requests returned 200 and OUT.

#### Result
Pass - Pass at demo level.

#### Bug Reference
None.

#### Evidence
- [Service test screenshot](evidence/2026-11-19-0926cf7-service-tests-pass.png); [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt).
- The manual results file is a transcription of reported results, not an original terminal capture.

#### Notes
- This record covers the stated preliminary scope; integrated acceptance and final sign-off remain pending.
