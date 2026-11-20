# S1-10a / BUG-S1-10a-11 - Since message remains after clock-out

## Bug Information
- Ticket: S1-10a; subtask: ST-02; session test: 1.9.
- Tester/report source: Zaarah Okkers; date: 20 November 2026.
- Tested commit: `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Severity: Medium (proposed). Status: Open - reported. Assignee: Not confirmed.

## Preconditions and Steps
- Start the frontend with `npm run dev` and open `http://localhost:5173/`. Use dummy data. Observe the reported scenario; further steps were not recorded.

## Expected Result
- Since clock-in message reflects the current state.

## Actual Result
- Since 8:40 remains displayed after clock-out.

## Evidence
- Zaarah's supplied report; screenshots and logs pending. Authentication and API were not tested.

## Suggested Fix and Retest
- Update the conditional message from authoritative status.
- Retest with an authorized test account/record, record the build and capture evidence; verify the real backend result where applicable.

## Resolution
- Pending QA verification.
