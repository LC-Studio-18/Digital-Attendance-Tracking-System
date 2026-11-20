# S1-10a / BUG-S1-10a-04 - Clock-out button design discrepancies

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-03
- Linked test case: TC-03
- Date reported: 18 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Elijah
- Severity: Medium (proposed QA classification)
- Status: Desktop button retest passed; Wendy to confirm conflicting design references.

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (detached testing worktree; QA branch QA4)
- Commit SHA / Figma version: `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3`; Figma node 99-194
- Browser: Not recorded
- Operating system: Windows
- Device: Not recorded

## Preconditions
Open the page on 3c12382 and compare Clock Out text and triangle colors with node 99-194.

## Steps to Reproduce
1. Compare the button shown on the rendered page with the supplied Figma clock-out design.
2. Inspect `Clockout.jsx` and `Clockout.css` for component label and styling.

## Expected Result
Button text and triangle colors match the supplied reference.

## Actual Result
The lime button rendered, but its text and triangle colors differ from the supplied design. Interactive behavior was not tested on this build.

## Evidence
- Historical 18 Nov screenshots show d7fb9f8 only; no screenshot for 3c12382 was saved.

## Fix and Retest History
- Date fixed: Pending
- Fix commit: Elijah: correct text and icon colors. QA will compare the current rendered button with the same Figma reference.
- Retest date: 19 November 2026 (prior build; current-build retest pending)
- Retest result: Pending current-build verification
- Notes: Compare updated button visually against the same design.

## Resolution
Awaiting QA verification.


### 20 November 2026 - Zaarah Okkers reported retest
- Tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`; Desktop button retest passed; Wendy to confirm conflicting design references.
- Her session used dummy data; real authentication and API were not tested. Screenshots/logs pending. Earlier mock-data approval understanding is superseded: real integration is required for S1-10a.
