# ST-04 - API Connection

## Information
- Ticket ID: S1-10a
- Assigned developers: Phumezile Sibeko, Elijah and Sibongile
- Current QA status: Blocked pending backend availability

## Objective
- Connect clock-out action to the backend API.

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
