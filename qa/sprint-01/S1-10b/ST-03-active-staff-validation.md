# ST-03 - Check that the employee is an active staff member

## Information
- Ticket ID: S1-10b
- Assigned developer: Zaarah Okkers
- Slack record: `Rec0CHN2SHDT2` (saved tracker export; not live verification).
- Current QA status: Pass at service-test level; integrated validation pending

## Objective
- Reject inactive staff members.

## Acceptance Criteria
- [x] The service rejects an inactive employee with error status 403.
- [ ] Integrated API validation rejects inactive employees with HTTP 403 (N01: Not Run).

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| A03 | Reject inactive staff members. | The service rejects an inactive employee with error status 403. | Pass |

The status above applies only to the stated test scope. Outstanding checks: N01; see the [ticket summary](README.md#testing-summary) for their definitions and statuses. Shared test IDs are counted once in the ticket summary.

## Linked Bugs
None recorded.

## Testing History

### 19 November 2026 SAST - Preliminary testing
- Tester: Adam Jattiem.
- Test case ID: A03.
- Branch: `backend4-feature/s1-10b-clock-out`.
- Commit SHA: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests).
- Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express, detached Git testing worktree, localhost:5000.
- Preconditions: Detached worktree at the tested commit; local demo service and relevant demo employee state or service-test fixtures. The required integration is unavailable for blocked checks.

#### Steps to Reproduce
1. Run `node --test src/tests/attendanceService.test.js` with the inactive employee fixture; expect service error status 403.
2. Check the result against the expected outcome and review the linked evidence.

#### Expected Result
- The service rejects an inactive employee with error status 403.

#### Actual Result
- The automated service test passed, verifying error status 403. It did not exercise or verify an HTTP response.

#### Result
Pass - Pass at service-test level; integrated validation pending.

#### Bug Reference
None.

#### Evidence
- [Service test screenshot](evidence/2026-11-19-0926cf7-service-tests-pass.png).
- The manual results file contains a written record of the reported test results, not the original terminal output.

#### Notes
- This record covers preliminary testing only. Integrated acceptance and final sign-off are still pending.
