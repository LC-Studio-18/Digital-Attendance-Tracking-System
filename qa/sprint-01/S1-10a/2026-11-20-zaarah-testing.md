# S1-10a - Zaarah testing session, 20 November 2026

- Tester: Zaarah Okkers. Frontend branch: `frontend4-feature/s1-10a-clock-out`. Tested commit: `ee8ff3e88a519727015d79ead5446e993ac48ddb`.
- Scope: dummy-data frontend only; authentication and API connectivity were not tested. `npm run dev`, `http://localhost:5173/`; desktop Figma comparison, tablet and desktop, mobile 393 x 852; source review of `frontend/src/pages/ClockOutPage.jsx`. Browser, OS and other viewport dimensions: Not recorded.
- Findings are supplied by Zaarah; Adam did not independently repeat them. Screenshots and logs for this session are pending. The 18 November evidence remains historical.

| ID | Reported finding | Result |
|---|---|---|
| 1.1 | Logo displayed correctly | Pass |
| 1.2 | Employee name colour matches design | Pass |
| 1.3 | Lime-green attendance badge matches design | Pass |
| 1.4 | Teal clock icon displayed | Pass |
| 1.5 | Attendance notice and information icon displayed | Pass |
| 1.6 | Literal {Employee} placeholder overlaps heading | Fail |
| 1.7 | Clock-in time hardcoded to 8:40 | Fail |
| 1.8 | Unknown or missing attendance statuses not handled | Fail |
| 1.9 | Since 8:40 remains displayed after clock-out | Fail |
| 2.1 | Cancel leaves status IN | Pass |
| 2.2 | Yes changes local status to OUT and displays time | Pass |
| 2.3 | Attendance notice remains active after clock-out | Fail |
| 3.1 | Rapid clicks and duplicate local clock-out prevented | Pass |
| 3.2 | Button disabled after clock-out | Pass |
| 3.3 | Loading feedback missing | Fail |
| 3.4 | Button styling matches tested design reference | Pass |
| 4.1 | Refresh resets status to IN | Fail |
| 4.2 | No console errors observed | Pass |
| 5.1 | Operation-confirmed success feedback missing | Fail |
| 5.2 | Approved success screen missing; card text changes | Fail |
| 6.1 | No error state or available failure path | Blocked |
| 6.2 | Status after failure could not be tested | Blocked |
| 6.3 | Retry could not be tested | Blocked |
| 7.1 | Screen renders at 393 x 852 | Pass |
| 7.2 | Overlapping elements reported | Fail |
| 7.3 | Horizontal scrolling reported | Fail |
| 7.4 | Clipped text reported | Fail |
| 7.5 | Unusable buttons reported | Fail |
| 8.1 | Button integration works | Pass |
| 8.2 | Local IN-to-OUT state setter works | Pass |
| 8.3 | Desktop screen and button match tested Figma reference | Pass |

- Total: 31; 15 Pass, 13 Fail, 3 Blocked, 0 Not Run. Cases 8.1-8.3 reuse observations from earlier in this session; they are not independent executions.
- Basic local feedback says ?You clocked out at...?; it does not establish backend-confirmed success. Error handling is missing by reported source review; runtime failure checks 6.1-6.3 were blocked. Mobile affected elements and detailed reproduction are not recorded; obtain details and screenshots.
- Real authentication, employee data, authoritative attendance status, backend API, confirmed success, error/retry and durable update are required before approval. Use authorized test accounts and records.
