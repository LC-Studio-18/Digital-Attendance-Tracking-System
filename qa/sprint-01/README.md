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
| [S1-15](S1-15/README.md) | Attendance status display | Not Run |

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
- Passed: 3
- Failed: 3
- Blocked: 3
- Not Run: 4
- Total: 13 (S1-10a only)
- Open bugs: 6 (including partially resolved BUG-S1-10a-02)
- Fixed pending current-build retest: 2

S1-10b separately: 10 unique functional tests passed (4 automated, 6 manual); one health check passed. Three checks are Blocked and seven are Not Run. These are not included in the S1-10a totals above. See [S1-10b](S1-10b/README.md) for scope and evidence.

## Outstanding Issues
- S1-10b requires Firebase verification, Google Sheets persistence, persistent status, Team 2 and frontend integration, contract verification, regression, and final code review. Final sign-off is pending.
- S1-10a has six open bugs (including one partially resolved) and two fixes pending current-build retest. Final QA sign-off is pending.
- S1-10a live-data and API-backed testing depend on backend availability and confirmation of the mock-data allowance scope. Success, error, current-build interactive loading and responsive checks remain outstanding. Build/lint are reported without located logs; automated Chromium checks were blocked by a socket-creation failure.

## QA Sign-off
- Status: Pending
- QA: Adam Jattiem
- Date: Pending
- Notes: S1-10a changes and retesting remain outstanding; S1-10b integration and final sign-off are pending.
