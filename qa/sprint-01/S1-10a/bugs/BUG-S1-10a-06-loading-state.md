# S1-10a / BUG-S1-10a-06 - Loading feedback is missing

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-03
- Linked test case: TC-02
- Date reported: 20 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Elijah
- Severity: Medium (proposed QA classification)
- Status: Open - loading feedback missing (3.3).

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (tested in detached worktree; QA4 documentation branch)
- Commit SHA: `f998ab224f8a83152be733ffbb791079a50869d3`
- Browser/device: Not recorded
- Operating system: Windows

## Preconditions
- Clock-out mock flow is available.

## Steps to Reproduce
1. Click Clock Out and observe the control while the operation is pending.

## Expected Result
- Clear loading feedback appears while work is pending and the control is disabled.

## Actual Result
- No loading state is implemented according to source review. The button became disabled after local completion, but no pending-state interaction was verified. Rapid repeated-click behavior was not independently completed.

## Evidence
- Source-confirmed finding based on supplied review context. No current-build screenshot/log available; no runtime loading test was completed.

## Fix and Retest History
- Required fix: provide visible pending feedback and prevent duplicate submissions.
- Proposed approach: Elijah can use an operation-in-progress state and disable the control until completion.
- QA retest: observe pending feedback, disabled state and rapid repeated clicks on updated build.
- Retest status: Not Run.

## Resolution
Open; awaiting implementation and QA retest.


### 20 November 2026 - Zaarah Okkers reported retest
- Tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`; Open - loading feedback missing (3.3).
- Her session used dummy data; real authentication and API were not tested. Screenshots/logs pending. Earlier mock-data approval understanding is superseded: real integration is required for S1-10a.
