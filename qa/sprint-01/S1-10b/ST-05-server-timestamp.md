# ST-05 - Generate a server-side timestamp

## Information
- Ticket ID: S1-10b
- Assigned developer: Zaarah Okkers
- Slack record: `Rec0CGVJ4HUE5` (saved tracker export; not live verification).
- Current QA status: Pass at demo level

## Objective
- Generate the clock-out timestamp on the server.

## Acceptance Criteria
- [x] Successful responses contain a server-generated timestamp.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| M01, M03 | Generate the clock-out timestamp on the server. | Successful responses contain a server-generated timestamp. | Pass |

The status above applies only to the stated test scope. Outstanding checks: N03; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: M01, M03.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. The required integration is unavailable for blocked checks.

#### Steps to Reproduce
1. Review timestamp generation in source and send first clock-out requests for demo UIDs 001 and 002.
2. Check the result against the expected outcome and review the linked evidence.

#### Expected Result
- Successful responses contain a server-generated timestamp.

#### Actual Result
- Source review and successful responses support server-side generation: 2026-11-19T07:30:38.228Z and 2026-11-19T07:39:17.776Z, respectively.

#### Result
Pass - Pass at demo level.

#### Bug Reference
None.

#### Evidence
- [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt); [EMP001 Postman screenshot](evidence/2026-11-19-0926cf7-clock-out-emp001-pass.png).
- The manual results file contains a written record of the reported test results, not the original terminal output.

#### Notes
- This record covers preliminary testing only. Integrated acceptance and final sign-off are still pending.
