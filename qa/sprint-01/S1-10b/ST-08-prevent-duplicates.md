# ST-08 - Prevent duplicate clock-out requests

## Information
- Ticket ID: S1-10b
- Assigned developer: Khanya Gcilitshane
- Slack record: `Rec0CHN2Z3V40` (saved tracker export; not live verification).
- Current QA status: Pass for sequential demo requests

## Objective
- Prevent duplicate clock-out requests.

## Acceptance Criteria
- [x] A sequential demo repeat is rejected.
- [ ] Concurrent duplicate prevention is verified (N04: Not Run).
- [ ] Integrated duplicate prevention is verified with Team 2 (N03: Not Run).

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| A02, M02, M04 | Prevent duplicate clock-out requests. | A sequential demo repeat is rejected. | Pass |

The status above applies only to the stated test scope. Outstanding checks: N03, N04; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: A02, M02, M04.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. For blocked checks, the required integration is unavailable.

#### Steps to Reproduce
1. Run the duplicate service test; clock out each demo UID and repeat the request sequentially.
2. Compare the observed result with the expected result and review the linked evidence.

#### Expected Result
- A sequential demo repeat is rejected.

#### Actual Result
- The service test passed. Both sequential repeats returned 409: You are not currently clocked in.

#### Result
Pass - Pass for sequential demo requests.

#### Bug Reference
None.

#### Evidence
- [Service test screenshot](evidence/2026-11-19-0926cf7-service-tests-pass.png); [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt).
- The manual results file is a transcription of reported results, not an original terminal capture.

#### Notes
- This record covers the stated preliminary scope; integrated acceptance and final sign-off remain pending.
