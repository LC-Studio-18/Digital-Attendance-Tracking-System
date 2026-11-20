# ST-07 - Update Attendance Status

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah.
- Current QA status: Prior-build mock transition Pass; current-build regression Not Run; API-backed verification Blocked.

## Objective
- Verify that attendance status updates after clock-out.

## Acceptance Criteria
- [ ] See original ticket acceptance criteria and Definition of Done in [S1-10a README](README.md).

## Test Cases

| Test ID | Scenario | Expected Result | Primary Status and Notes |
|---|---|---|---|
| TC-01 | Verify local status update after clock-out | Status changes from IN to OUT after successful operation | Pass - observed on f998ab2 mock runtime; current-build regression pending. |
| TC-02 | Verify status after API clock-out | Successful API response updates displayed status | Blocked - API-backed verification unavailable. |

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


### 19 November 2026 - Prior-build mock runtime
- On `f998ab224f8a83152be733ffbb791079a50869d3`, click changed local attendance status IN to OUT. Refresh reset it to IN and removed the displayed clock-out time. This confirms local React-state behavior and non-persistence, not a defect against a stated persistence requirement. TC-01 Pass for the local transition; API-backed TC-02 Blocked. BUG-S1-10a-05 is fixed in source and was verified on the prior runtime build; current-build regression remains pending.
- Prepared feedback, not sent: Elijah to update status only after successful operation; implement mock persistence only if required; coordinate with Zaarah on S1-15 dummy service to avoid unnecessary duplication. QA will test successful/failed operations, refresh behavior if persistence is required, and API-backed state once available.
