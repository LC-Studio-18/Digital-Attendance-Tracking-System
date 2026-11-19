# ST-07 - Update the employee's attendance status to OUT

## Information
- Ticket ID: S1-10b
- Assigned developer: Khanya Gcilitshane
- Slack record: `Rec0CGXCL3R5J` (saved tracker export; not live verification).
- Current QA status: Pass at demo level; persistence and integration pending

## Objective
- Update attendance status after clock-out.

## Acceptance Criteria
- [x] Successful demo clock-outs return OUT.
- [ ] Integrated attendance status persists (N02: Not Run); Team 2 integration remains untested (N03: Not Run).

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| M01, M03 | Update attendance status after clock-out. | Successful demo clock-outs return OUT. | Pass |

The status above applies only to the stated test scope. Outstanding checks: N02, N03; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

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
1. Send first clock-out requests for demo UIDs 001 and 002 and inspect the returned status.
2. Check the result against the expected outcome and review the linked evidence.

#### Expected Result
- Successful demo clock-outs return OUT.

#### Actual Result
- Both responses returned OUT; whether the integrated status remains saved was not verified.

#### Result
Pass - Pass at demo level; persistence and integration pending.

#### Bug Reference
None.

#### Evidence
- [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt); [EMP001 Postman screenshot](evidence/2026-11-19-0926cf7-clock-out-emp001-pass.png).
- The manual results file contains a written record of the reported test results, not the original terminal output.

#### Notes
- This record covers preliminary testing only. Integrated acceptance and final sign-off are still pending.
