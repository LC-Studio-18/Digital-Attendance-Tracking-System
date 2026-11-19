# ST-10 - Handle invalid requests and duplicate clock-out attempts

## Information
- Ticket ID: S1-10b
- Assigned developer: Khanya Gcilitshane
- Slack record: `Rec0CGCAEUN3Z` (saved tracker export; not live verification).
- Current QA status: Pass for executed demo scenarios

## Objective
- Return appropriate errors for tested invalid and duplicate requests.

## Acceptance Criteria
- [x] Sequential repeats return 409, unknown UID returns 404, and a missing demo header returns 401.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| M02, M04, M05, M06 | Return appropriate errors for tested invalid and duplicate requests. | Sequential repeats return 409, unknown UID returns 404, and a missing demo header returns 401. | Pass |

The status above applies only to the stated test scope. Outstanding checks: N05; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: M02, M04, M05, M06.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. The required integration is unavailable for blocked checks.

#### Steps to Reproduce
1. Repeat successful demo requests, send an unknown UID, and omit the demo header; inspect status and body.
2. Check the result against the expected outcome and review the linked evidence.

#### Expected Result
- Sequential repeats return 409, unknown UID returns 404, and a missing demo header returns 401.

#### Actual Result
- Repeats returned 409 (You are not currently clocked in.); unknown UID returned 404 (Employee not found.); missing header returned 401 (Authentication required.).

#### Result
Pass - Pass for executed demo scenarios.

#### Bug Reference
None.

#### Evidence
- [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt).
- The manual results file contains a written record of the reported test results, not the original terminal output.

#### Notes
- This record covers preliminary testing only. Integrated acceptance and final sign-off are still pending.
- Diagnostic: Postman showed HTTP 409 with a stale-looking success body; subsequent cURL returned the correct error body. Cause unconfirmed; not a confirmed backend defect. Error response formats differ between demo authentication and service errors; verify against the agreed contract.
