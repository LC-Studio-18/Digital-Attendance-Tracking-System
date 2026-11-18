# ST-07 - Update Attendance Status

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah (18 November tracker export `Project_tracker(6).json`, as supplied).
- Additional Sprint Brief collaborators: None recorded.
- Current QA status: Fail for static logic; API end-to-end test Blocked

## Objective
- Verify status updates after clock-out.

## Acceptance Criteria
- [ ] Attendance status updates after successful clock-out.

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Review state update logic | New attendance status is applied | Fail - static review |
| TC-02 | Verify status update after API clock-out | Successful API response updates displayed status | Blocked |

## Linked Bugs
- [BUG-S1-10a-05](bugs/BUG-S1-10a-05-state-setter.md)

## Testing History
### 18 November 2026 - Static code review
- Tester: Adam Jattiem. Commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8.
- Inspected `Clockout.jsx` and `ClockOutPage.jsx`.
- Expected: The page displays the updated API-backed attendance status after a successful clock-out.
- Actual: `Clockout === 'Clockin' ? 'Clockout' : 'Clockin'` calculates a value but does not call `setClockout()`. The page passes a hardcoded `"in"` value to `StatusCard`.
- Result: TC-01 Fail (static logic check); TC-02 Blocked (API-backed end-to-end test not run).
- Bug: BUG-S1-10a-05 (High, proposed QA severity; static finding pending runtime verification).

#### Additional history fields
- Test case ID: TC-01, TC-02.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; browser and device not recorded.
- Preconditions: Source available for review; backend unavailable.

#### Steps to Reproduce
1. Inspected Clockout.jsx and ClockOutPage.jsx; no API-backed test was performed.

#### Expected Result
- Attendance status updates after successful clock-out.

#### Actual Result
- See static finding and blocked result above.

#### Result
- TC-01 Fail (static review); TC-02 Blocked.

#### Bug Reference
- BUG-S1-10a-05

#### Evidence
- Static source review; no runtime state-change evidence recorded.

#### Notes
- Verify the finding at runtime and retest API-backed behavior when available.
