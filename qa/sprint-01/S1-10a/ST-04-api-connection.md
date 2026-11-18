# ST-04 - API Connection

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah (18 November tracker export `Project_tracker(6).json`, as supplied).
- Additional Sprint Brief collaborators: Phumezile Sibeko and Sibongile.
- Current QA status: Blocked pending backend availability

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
