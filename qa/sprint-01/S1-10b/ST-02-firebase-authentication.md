# ST-02 - Verify the employee's Firebase authentication token

## Information
- Ticket ID: S1-10b
- Assigned developer: Zaarah Okkers
- Slack record: `Rec0CHN2S3WLQ` (saved tracker export; not live verification).
- Current QA status: Blocked

## Objective
- Verify a real Firebase authentication token.

## Acceptance Criteria
- [ ] A valid Firebase token is verified and invalid or missing tokens are rejected.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| B01 | Verify a real Firebase authentication token. | A valid Firebase token is verified and invalid or missing tokens are rejected. | Blocked |

The status above applies only to the stated test scope. Outstanding checks: B01; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: B01.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. For blocked checks, the required integration is unavailable.

#### Steps to Reproduce
1. Send requests with valid, invalid and missing Firebase tokens to an integrated endpoint.
2. Compare the observed result with the expected result and review the linked evidence.

#### Expected Result
- A valid Firebase token is verified and invalid or missing tokens are rejected.

#### Actual Result
- Not executed: real token verification is not implemented; the demo UID header is not authentication.

#### Result
Blocked - Blocked.

#### Bug Reference
None.

#### Evidence
- [Manual API results transcription](evidence/2026-11-19-0926cf7-manual-api-results.txt).
- The manual results file is a transcription of reported results, not an original terminal capture.

#### Notes
- This record covers the stated preliminary scope; integrated acceptance and final sign-off remain pending.
