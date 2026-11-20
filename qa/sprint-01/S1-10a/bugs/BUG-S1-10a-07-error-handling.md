# S1-10a / BUG-S1-10a-07 - Clock-out failure feedback is missing

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-06
- Linked test case: TC-01
- Date reported: 20 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Elijah
- Severity: High (proposed QA classification)
- Status: Open - missing error handling by source review; runtime checks 6.1-6.3 blocked.

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (source review; QA4 documentation branch)
- Commit SHA: `f998ab224f8a83152be733ffbb791079a50869d3`
- Browser/device: Not recorded
- Operating system: Windows

## Preconditions
- Source review; no request/failure mechanism was available for runtime injection.

## Steps to Reproduce
1. Cause the clock-out operation to fail after failure handling is implemented.
2. Observe the error message and attendance state; retry.

## Expected Result
- A clear error appears, status remains unchanged, and retry is possible.

## Actual Result
- Error handling is absent according to source inspection. Runtime failure testing was not performed because there is no request/failure path.

## Evidence
- Source-confirmed finding per supplied 19 Nov review. No runtime error evidence or saved log is available.

## Fix and Retest History
- Required fix: clear error feedback and unchanged status on failed operation.
- Proposed approach: allow retry and use `try/catch/finally` where appropriate.
- QA retest: force an operation failure; verify message, unchanged state and retry.
- Retest status: Not Run.

## Resolution
Open; awaiting implementation and QA retest.


### 20 November 2026 - Zaarah Okkers reported retest
- Tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`; Open - missing error handling by source review; runtime checks 6.1-6.3 blocked.
- Her session used dummy data; real authentication and API were not tested. Screenshots/logs pending. Earlier mock-data approval understanding is superseded: real integration is required for S1-10a.
