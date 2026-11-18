# S1-10a / BUG-S1-10a-05 - Attendance state setter never called

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-07
- Linked test case: TC-01
- Date reported: 18 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Elijah
- Severity: High (proposed QA classification)
- Status: Open - static finding pending runtime verification

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (detached testing worktree; QA branch QA4)
- Commit SHA / Figma version: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`
- Browser: Not recorded
- Operating system: Windows
- Device: Not recorded

## Preconditions
- Static inspection of `Clockout.jsx` and `ClockOutPage.jsx`.

## Steps to Reproduce
1. Inspect the clock-out status toggle expression and state setter call sites in `Clockout.jsx`.
2. Inspect the value passed to `StatusCard` in `ClockOutPage.jsx`.

## Expected Result
- After successful clock-out, the page displays the updated attendance status.

## Actual Result
- `Clockout === 'Clockin' ? 'Clockout' : 'Clockin'` calculates a value without calling `setClockout()`. The page passes hardcoded `"in"` to `StatusCard`. This is a static code-review finding; API-backed runtime verification remains pending.

## Evidence
- Static source finding recorded in [ST-07](../ST-07-update-status.md). Screenshots are not evidence of state changes.

## Fix and Retest History
- Date fixed: Pending
- Fix commit: Pending
- Retest date: Pending
- Retest result: Pending
- Notes: Verify displayed and API-backed status after a successful clock-out; inspect the corrected state update.

## Resolution
Pending QA verification.
