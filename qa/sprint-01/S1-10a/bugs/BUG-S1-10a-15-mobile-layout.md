# S1-10a / BUG-S1-10a-15 - Mobile layout and controls reported unusable

## Bug Information
- Ticket: S1-10a; subtask: ST-08; session test: 7.2-7.5.
- Tester/report source: Zaarah Okkers; date: 20 November 2026.
- Tested commit: `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Severity: Medium (proposed). Status: Open - reported. Assignee: Not confirmed.

## Preconditions and Steps
- Start the frontend with `npm run dev` and open `http://localhost:5173/`. Use dummy data. Inspect the screen at 393 x 852; exact elements and further steps were not recorded.

## Expected Result
- At 393 x 852 content and buttons are usable without clipping, overlap or horizontal scrolling.

## Actual Result
- Overlap, horizontal scrolling, clipped text and unusable buttons reported; specific elements not recorded.

## Evidence
- Zaarah's supplied report; screenshots and logs pending. Authentication and API were not tested.

## Suggested Fix and Retest
- Correct identified layout issues after obtaining reproduction details and screenshots.
- Retest with an authorized test account/record, record the build and capture evidence; verify the real backend result where applicable.

## Resolution
- Pending QA verification.
