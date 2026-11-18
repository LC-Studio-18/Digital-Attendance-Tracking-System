# S1-10a / BUG-S1-10a-02 - Incorrect attendance fallback messaging

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-02
- Linked test case: TC-02
- Date reported: 18 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Phumezile Sibeko
- Severity: Medium (proposed QA classification)
- Status: Open - static finding pending runtime verification

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (detached testing worktree; QA branch QA4)
- Commit SHA / Figma version: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`
- Browser: Not recorded
- Operating system: Windows
- Device: Not recorded

## Preconditions
- Static review of the attendance fallback logic; API-backed status unavailable.

## Steps to Reproduce
1. Inspect `StatusCard.jsx` and the status conditional/fallback used by the clock-out page.
2. At runtime, provide clocked-out and unexpected status values when the API is available.

## Expected Result
- Clocked-out and unexpected values receive accurate, distinguishable messaging.

## Actual Result
- Static review indicates clocked-out employees may be told they have not clocked in, and unexpected status values use the same fallback. This is a code-review finding requiring runtime verification, not a confirmed runtime observation.

## Evidence
- Static code-review finding recorded in [ST-02](../ST-02-employee-name-and-status.md). No screenshot is applicable to this logic finding; available screenshots show visual appearance only.

## Fix and Retest History
- Date fixed: Pending
- Fix commit: Pending
- Retest date: Pending
- Retest result: Pending
- Notes: Verify clocked-out and unexpected values at runtime with appropriate API/test data.

## Resolution
Pending QA verification.
