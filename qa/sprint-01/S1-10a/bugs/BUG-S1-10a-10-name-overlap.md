# S1-10a / BUG-S1-10a-10 - Employee placeholder overlaps heading

## Bug Information
- Ticket: S1-10a; subtask: ST-02; session test: 1.6.
- Tester/report source: Zaarah Okkers; date: 20 November 2026.
- Tested commit: `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Severity: Medium (proposed). Status: Open - reported. Assignee: Not confirmed.

## Preconditions and Steps
- Start the frontend with `npm run dev` and open `http://localhost:5173/`. Use dummy data. Observe the reported scenario; further steps were not recorded.

## Expected Result
- Employee name displays without overlap.

## Actual Result
- Literal {Employee} placeholder overlaps heading.

## Evidence
- Zaarah's supplied report; screenshots and logs pending. Authentication and API were not tested.

## Suggested Fix and Retest
- Render the actual employee name and fix layout.
- Retest with an authorized test account/record, record the build and capture evidence; verify the real backend result where applicable.

## Resolution
- Pending QA verification.
