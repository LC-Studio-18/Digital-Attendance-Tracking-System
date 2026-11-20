# S1-10a / BUG-S1-10a-01 - Clock-out screen does not match the Figma wireframe

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-01
- Linked test case: TC-02
- Date reported: 18 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Phumezile Sibeko
- Severity: Medium (proposed QA classification)
- Status: Open

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (tested in detached worktree; QA branch QA4)
- Commit SHA / Figma version: `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3`; Figma node 99-194 (coloured reference approval not independently verified)
- Browser: Not recorded
- Operating system: Windows
- Device: Not recorded

## Preconditions
Open the rendered clock-out page at 3c12382 and compare it with supplied coloured node 99-194.

## Steps to Reproduce
1. Open the running application and compare its clock-out page with the supplied Figma wireframe.

## Expected Result
The rendered page conforms to the supplied coloured Figma reference.

## Actual Result
On 20 Nov the page rendered, with dark header, teal background, dark card and lime button. The logo, green employee name/status badge, button text/triangle colours, correct information message/icon and matching clock icon remain discrepant. Source review found the name span uses `clockout-h1` as an attribute instead of `className="clockout-h1"`. Earlier grayscale wireframe and coloured reference are distinct.

## Evidence
- [18 Nov expected image](../evidence/2026-11-18-clock-out-figma-expected.png) and [18 Nov actual image at d7fb9f8](../evidence/2026-11-18-d7fb9f8-clock-out-actual.png) are historical only. No screenshot for 3c12382 was saved; no fabricated evidence.

## Fix and Retest History
- Date fixed: Pending
- Fix commit: Phumezile: correct className and remaining Figma styling. QA will compare a fresh build against the supplied coloured reference and capture evidence during the next authorized test.
- Retest date: 19 November 2026 (prior build; current-build retest pending)
- Retest result: Pending current-build verification
- Notes: Retest the page against the same Figma reference.

## Resolution
Awaiting QA verification.
