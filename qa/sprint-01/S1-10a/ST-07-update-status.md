# ST-07 - Update Attendance Status

## Information
- Ticket ID: S1-10a
- Assigned developer: Elijah
- Current QA status: Fail for static logic; API end-to-end test Blocked

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Review state update logic | New status is applied through the state setter | Fail - static review |
| TC-02 | Verify status update after API clock-out | Successful API response updates displayed status | Blocked |

## Linked Bugs
- [BUG-S1-10a-05](bugs/BUG-S1-10a-05-state-setter.md)

## Testing History
### 18 November 2026 - Static code review
- Tester: Adam Jattiem. Commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8.
- Inspected `Clockout.jsx` and `ClockOutPage.jsx`.
- Expected: State setter applies the new attendance value and the page displays API-backed status.
- Actual: `Clockout === 'Clockin' ? 'Clockout' : 'Clockin'` calculates a value but does not call `setClockout()`. The page passes a hardcoded `"in"` value to `StatusCard`.
- Result: TC-01 Fail (static logic check); TC-02 Blocked (API-backed end-to-end test not run).
- Bug: BUG-S1-10a-05 (High, proposed QA severity; static finding pending runtime verification).
