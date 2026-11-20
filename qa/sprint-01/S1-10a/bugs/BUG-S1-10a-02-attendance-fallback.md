# S1-10a / BUG-S1-10a-02 - Incorrect attendance fallback messaging

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-02
- Linked test case: TC-02
- Date reported: 18 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Phumezile Sibeko
- Severity: Medium (proposed QA classification)
- Status: Open - unexpected or missing attendance status handling remains incomplete.

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (detached testing worktree; QA branch QA4)
- Commit SHA / Figma version: `f998ab224f8a83152be733ffbb791079a50869d3` (runtime); `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3` (latest styling build)
- Browser: Not recorded
- Operating system: Windows
- Device: Not recorded

## Preconditions
Using appropriate mock/test data, show IN, then OUT, then an unexpected value and inspect each message.

## Steps to Reproduce
1. Inspect `StatusCard.jsx` and the status conditional/fallback used by the clock-out page.
2. At runtime, provide clocked-out and unexpected status values when the API is available.

## Expected Result
IN, OUT and unexpected statuses display accurate, distinct messages.

## Actual Result
On f998ab2 mock status changed IN to OUT and OUT messaging improved. Unexpected attendance status handling remains incomplete. Live employee data was not verified. Mock data itself is allowed and is not a defect.

## Evidence
- 19 Nov manual runtime report: mock IN-to-OUT and improved OUT message. No screenshot/log saved. Current-build fallback regression was not run.

## Fix and Retest History
- Date fixed: Pending
- Fix commit: Phumezile: structure mock employee information and explicitly handle IN, OUT and unexpected states. QA will test all three states and verify live data when available.
- Retest date: 19 November 2026 (prior build; current-build retest pending)
- Retest result: Pending current-build verification
- Notes: Verify clocked-out and unexpected values at runtime with appropriate API/test data.

## Resolution
Awaiting QA verification.


### 20 November 2026 - Zaarah Okkers reported retest
- Tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`; Open - unexpected or missing attendance status handling remains incomplete.
- Her session used dummy data; real authentication and API were not tested. Screenshots/logs pending. Earlier mock-data approval understanding is superseded: real integration is required for S1-10a.
