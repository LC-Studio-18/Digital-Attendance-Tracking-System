# ST-04 - API Connection

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah; Sprint Brief collaborators: Phumezile Sibeko and Sibongile.
- Current QA status: Fail by existing source review: real API implementation missing. Zaarah did not test authentication or API connectivity. Real integration is mandatory.

## Objective
- Connect the clock-out action to the backend API.

## Acceptance Criteria
- [ ] See original ticket acceptance criteria and Definition of Done in [S1-10a README](README.md).

## Test Cases

| Test ID | Scenario | Expected Result | Primary Status and Notes |
|---|---|---|---|
| TC-01 | Send clock-out request and inspect response | Request is sent and its response is handled | Fail - source review confirms request implementation absent; live execution blocked. |

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
- Historical prepared feedback, superseded by mandatory real integration: Elijah to add an asynchronous mock service for mock-path feedback, coordinate real API implementation, and confirm with Scrum Masters whether live integration is required this sprint. QA will inspect the request and verify success/failure against the available endpoint once scope and backend are clear. Do not mark the explicit API acceptance criterion waived based only on mock allowance.


### 20 November 2026 - Zaarah Okkers retest
- Tester: Zaarah Okkers; tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Dummy-data frontend only; authentication and API connectivity were not tested.
- Fail by existing source review: real API implementation missing. Zaarah did not test authentication or API connectivity. Real integration is mandatory.
- Evidence: supplied tester report; session screenshots/logs pending. See [complete session](2026-11-20-zaarah-testing.md). Real integration is mandatory for S1-10a approval.
