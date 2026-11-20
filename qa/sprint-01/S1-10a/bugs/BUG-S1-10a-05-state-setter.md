# S1-10a / BUG-S1-10a-05 - Attendance state setter never called

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-07
- Linked test case: TC-01
- Date reported: 18 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Elijah
- Severity: High (proposed QA classification)
- Status: Verified fixed for local state updates in Zaarah reported regression 8.2; backend state unverified.

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (detached testing worktree; QA branch QA4)
- Commit SHA / Figma version: `f998ab224f8a83152be733ffbb791079a50869d3` runtime; current build `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3` not interactively retested
- Browser: Not recorded
- Operating system: Windows
- Device: Not recorded

## Preconditions
On f998ab2, observe IN, click Clock Out, observe OUT/time, then refresh and observe reset.

## Steps to Reproduce
1. Inspect the clock-out status toggle expression and state setter call sites in `Clockout.jsx`.
2. Inspect the value passed to `StatusCard` in `ClockOutPage.jsx`.

## Expected Result
A successful clock-out updates the displayed local status to OUT.

## Actual Result
On f998ab2, clicking changed local status IN to OUT and showed the time. Refresh reset status to IN and removed the time. This is mock in-memory behavior. It does not by itself establish a persistence requirement defect. API-backed status remains a separate blocked concern.

## Evidence
- 19 Nov runtime observation (no screenshot/log saved).

## Fix and Retest History
- Date fixed: Pending
- Fix commit: Elijah: update status only after successful operation; add mock persistence only if required and coordinate with Zaarah on S1-15 dummy service. QA will test success/failure and persistence only against agreed requirements.
- Retest date: 19 November 2026 (prior build; current-build retest pending)
- Retest result: Pending current-build verification
- Notes: Verify displayed and API-backed status after a successful clock-out; inspect the corrected state update.

## Resolution
Awaiting QA verification.


### 20 November 2026 - Zaarah Okkers reported retest
- Tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`; Verified fixed for local state updates in Zaarah reported regression 8.2; backend state unverified.
- Her session used dummy data; real authentication and API were not tested. Screenshots/logs pending. Earlier mock-data approval understanding is superseded: real integration is required for S1-10a.
