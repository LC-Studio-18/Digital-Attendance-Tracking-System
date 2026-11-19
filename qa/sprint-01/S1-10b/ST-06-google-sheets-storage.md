# ST-06 - Save the employee ID, Firebase UID and clock-out time to Google Sheets

## Information
- Ticket ID: S1-10b
- Assigned developer: Zaarah Okkers
- Slack record: `Rec0CGXCEL7D2` (saved tracker export; not live verification).
- Current QA status: Blocked

## Objective
- Persist the clock-out record in Google Sheets.

## Acceptance Criteria
- [ ] The correct employee ID, Firebase UID and clock-out time are saved to Google Sheets.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| B02 | Persist the clock-out record in Google Sheets. | The correct employee ID, Firebase UID and clock-out time are saved to Google Sheets. | Blocked |

The status above applies only to the stated test scope. Outstanding checks: B02; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: B02.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. For blocked checks, the required integration is unavailable.

#### Steps to Reproduce
1. Clock out an eligible employee and independently inspect the corresponding Google Sheets record.
2. Compare the observed result with the expected result and review the linked evidence.

#### Expected Result
- The correct employee ID, Firebase UID and clock-out time are saved to Google Sheets.

#### Actual Result
- Not executed: the tested implementation stores data in memory, not Google Sheets.

#### Result
Blocked - Blocked.

#### Bug Reference
None.

#### Evidence
- [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt).
- The manual results file is a transcription of reported results, not an original terminal capture.

#### Notes
- This record covers the stated preliminary scope; integrated acceptance and final sign-off remain pending.
