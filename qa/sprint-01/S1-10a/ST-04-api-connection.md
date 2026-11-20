# ST-04 - API Connection

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah; Sprint Brief collaborators: Phumezile Sibeko and Sibongile.
- Current QA status: Fail by source review (request implementation absent); API execution Blocked. Scrum Masters' mock-data allowance does not establish that the explicit API criterion was waived.

## Acceptance Criteria
- [ ] Frontend sends clock-out request to backend and handles its response.

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Send clock-out request and inspect response | Request reaches available backend and result is handled | Blocked - no request implementation; integration execution unavailable |

## Objective
- Connect clock-out action to the backend API.

## Acceptance Criteria
- [ ] Clock-out request connects successfully to the backend.

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Send clock-out request and inspect API response | Request succeeds against available backend | Blocked |

## Linked Bugs
None. Backend dependency unavailable; this is not classified as a frontend defect.

## Testing History
### 18 November 2026 - Dependency status
- Tester: Adam Jattiem. Commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8.
- Expected: API request completes against the available backend.
- Actual: Backend/API dependency was unavailable for this test.
- Result: Blocked; no API-backed test was run. Unavailable backend dependency is not classified as a frontend defect.
- Retest when backend/API is available.

#### Additional history fields
- Test case ID: TC-01.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; browser and device not recorded.
- Preconditions: Backend unavailable.

#### Steps to Reproduce
1. No API test steps were performed because the backend was unavailable.

#### Expected Result
- Clock-out request connects successfully to the backend.

#### Actual Result
- Backend unavailable; request not tested.

#### Result
- TC-01 Blocked.

#### Bug Reference
- None.

#### Evidence
- No API test evidence recorded.

#### Notes
- Retest when backend is available.


### 19-20 November 2026 - Source review and integration status
- Reviewed supplied findings for `f998ab224f8a83152be733ffbb791079a50869d3` and `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3`. No clock-out Fetch/XHR request was observed on f998ab2; source review confirms no API request implementation. Expected: send request and handle backend result. Actual: local mock behavior only; no live request. TC-01 execution is Blocked; the missing implementation is a source-confirmed acceptance gap, tracked by BUG-S1-10a-08.
- Prepared feedback, not sent: Elijah to add an asynchronous mock service for mock-path feedback, coordinate real API implementation, and confirm with Scrum Masters whether live integration is required this sprint. QA will inspect the request and verify success/failure against the available endpoint once scope and backend are clear. Do not mark the explicit API acceptance criterion waived based only on mock allowance.
