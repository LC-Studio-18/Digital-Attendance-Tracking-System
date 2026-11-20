# Sprint 1 - Team 4 QA

## Sprint Information
- QA: Adam Jattiem
- Scrum Master: Not recorded
- Start date: Not recorded
- End date: Not recorded
- Last updated: 20 November 2026

## Sprint Goal
Deliver clock-out functionality and staff attendance
status integrated with Team 2's clock-in functionality.

## Assigned Tickets

| Ticket | Description | QA Status |
|---|---|---|
| [S1-08](S1-08/README.md) | Attendance interface design | Not Run |
| [S1-10a](S1-10a/README.md) | Clock-out frontend | Fail - changes required |
| [S1-10b](S1-10b/README.md) | Clock-out backend | Preliminary Pass — Awaiting Integration |
| [S1-15](S1-15/README.md) | Attendance status display | Preliminary developer findings; independent QA Not Run |

## Testing Scope
- Design validation
- Functional testing
- API testing
- Authentication testing
- Data persistence
- Integration testing
- Mobile responsiveness
- Regression testing

## Dependencies
- Team 2 clock-in functionality.
- Shared attendance and API contract.
- Firebase authentication.
- Google Sheets integration.

## Testing Summary
The following current totals cover S1-10a only; they are not sprint-wide totals.
- Total test cases: 13
- Passed: 4
- Failed: 6
- Blocked: 3
- Not Run: 0
- Open bugs: 6 (including partially resolved BUG-S1-10a-02)
- Fixed pending current-build retest: 2

S1-10b separately: 10 unique functional tests passed (4 automated, 6 manual); one health check passed. Three checks are Blocked and seven are Not Run. These are not included in the S1-10a totals above. See [S1-10b](S1-10b/README.md) for scope and evidence.

## Outstanding Issues
- S1-10b requires Firebase verification, Google Sheets persistence, persistent status, Team 2 and frontend integration, contract verification, regression, and final code review. Final sign-off is pending.
- S1-10a has 16 tracked reports: BUG-03 and BUG-05 verified fixed for local frontend behavior; BUG-01 and BUG-04 passed desktop retest with design clarification pending; BUG-02 and BUG-06 through BUG-16 remain open or pending verification. Adam?s original 13 cases are historical; Zaarah?s 31 cases are separate. Final QA sign-off is pending.
- S1-10a requires real authenticated employee/status data and backend API integration; mock data cannot complete or approve the ticket. Zaarah Okkers reported 15 Pass, 13 Fail and 3 Blocked in a separate 31-case frontend session on `ee8ff3e`; these are not independently reproduced QA results. Adam's original 13-case totals remain separate. Backend-confirmed success, error/retry, durable status and mobile retests remain outstanding. Build/lint are reported without located logs; automated Chromium checks were blocked by a socket-creation failure.
- S1-15 has preliminary developer findings from Zaarah and source-review notes for frontend commit `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`. These are not independent runtime QA results and are excluded from the S1-10a test totals above. Four reported-defect reports are linked; none is closed. Independent QA and sign-off are pending. Real API, authenticated identity, backend persistence and cross-team integration remain unverified.

## QA Sign-off
- Status: Pending
- QA: Adam Jattiem
- Date: Pending
- Notes: S1-10a changes and retesting remain outstanding; S1-10b integration and final sign-off are pending.
