# S1-10b - Develop the clock out functionality

## Ticket Information
- Category: Backend development
- Sprint: 1
- Team: 4
- QA tester: Adam Jattiem
- Slack ticket: [S1-10b](https://lifechoicesnpo.slack.com/lists/T02LW4RMXJQ/F0CG5PD0XB6?record_id=Rec0CGXAHHH60)
- Source: Saved Slack tracker export supplied by the tester; assignments and order are not live Slack verification. ST numbers are local documentation identifiers.
- Developers: Khanya Gcilitshane and Zaarah Okkers
- Feature branch: `backend4-feature/s1-10b-clock-out`
- QA branch: `QA4`
- QA status: Preliminary Pass — Awaiting Integration

## Requirements
- User story: As the system, I need to process and securely store clock-out requests so that employees' departure times are accurately recorded.
- Verify Firebase identity and active staff membership, confirm the employee is clocked in, generate a server-side timestamp, record employee ID, Firebase UID and clock-out time in Google Sheets, update status to OUT, prevent duplicates and return appropriate responses.

## Acceptance Criteria

### Verified preliminary criteria
- [x] Demo clock-out requests for IN employees return HTTP 200 and OUT (M01, M03).
- [x] The service rejects inactive employees with error status 403 (A03); no HTTP response was tested for this case.
- [x] The service rejects an employee without a previous clock-in with error status 409 (A04).
- [x] Source review and successful demo responses support server-side timestamp generation (M01, M03).
- [x] Sequential duplicate demo requests are rejected (M02, M04); the duplicate service test also passed (A02).
- [x] The tested unknown UID and missing demo header produce the expected demo errors (M05, M06).

### Outstanding integrated criteria
- [ ] Valid authenticated and eligible employees can clock out through the integrated API.
- [ ] Real Firebase tokens are verified and invalid authentication is rejected.
- [ ] Inactive employees and employees without a previous clock-in are rejected.
- [ ] Clock-out time is generated on the server and the employee ID, Firebase UID and time are saved to Google Sheets.
- [ ] Attendance status changes to OUT and persists.
- [ ] Duplicate clock-outs are prevented, including integrated and concurrent requests.
- [ ] Success and error responses conform to the agreed API contract and are handled by the frontend.

Unchecked criteria reflect final integrated acceptance; individual preliminary results are recorded below.

## Definition of Done
- [ ] All ticket functionality and dependencies are integrated.
- [ ] Firebase authentication, Google Sheets storage and durable attendance status are verified.
- [ ] Team 2 clock-in and frontend/backend integration are verified against the agreed API contract.
- [ ] Integration and regression testing are completed and findings addressed.
- [ ] Final code review and approval are completed.
- [ ] Final QA sign-off is granted.

## Out of Scope
- Not specified in the supplied ticket information.

## Dependencies
- Firebase authentication and Google Sheets integration.
- Team 2 clock-in functionality and persistent attendance status.
- Frontend/backend integration and the agreed attendance API contract.

## Subtasks

| ID | Description | Assigned developer | QA Status | Report |
|---|---|---|---|---|
| ST-01 | Create the clock-out API endpoint | Khanya Gcilitshane | Pass at demo level | [Report](ST-01-api-endpoint.md) |
| ST-02 | Verify Firebase authentication token | Zaarah Okkers | Blocked | [Report](ST-02-firebase-authentication.md) |
| ST-03 | Check active staff membership | Zaarah Okkers | Pass at service-test level; integrated validation pending | [Report](ST-03-active-staff-validation.md) |
| ST-04 | Check currently clocked-in status | Khanya Gcilitshane | Pass at demo level | [Report](ST-04-clocked-in-validation.md) |
| ST-05 | Generate server-side timestamp | Zaarah Okkers | Pass at demo level | [Report](ST-05-server-timestamp.md) |
| ST-06 | Save record to Google Sheets | Zaarah Okkers | Blocked | [Report](ST-06-google-sheets-storage.md) |
| ST-07 | Update attendance status to OUT | Khanya Gcilitshane | Pass at demo level; persistence pending | [Report](ST-07-update-status.md) |
| ST-08 | Prevent duplicate clock-out requests | Khanya Gcilitshane | Pass for sequential demo requests | [Report](ST-08-prevent-duplicates.md) |
| ST-09 | Return successful response to frontend | Khanya Gcilitshane | Pass for API response; frontend integration Blocked | [Report](ST-09-success-response.md) |
| ST-10 | Handle invalid and duplicate requests | Khanya Gcilitshane | Pass for executed demo scenarios | [Report](ST-10-invalid-requests.md) |

## Linked Bugs
None recorded. No backend bugs were confirmed in the executed tests.

## Testing Summary
- Tested commit: `0926cf753e474531480342f049ee92689a97b1b9` (Implement clock-out feature with tests), in a detached testing worktree.
- Date: 19 November 2026 SAST. Environment: Windows, Git Bash UCRT64, VS Code, Postman, cURL, Node.js, Express and localhost:5000.
- Unique executed functional tests: **10 Pass, 0 Fail**: 4 automated service tests and 6 manual API tests. Shared IDs in subtask reports are not counted again.
- Automated command: `node --test src/tests/attendanceService.test.js`: A01 successful IN clock-out; A02 duplicate prevention; A03 inactive employee rejected (service error status 403); A04 no previous clock-in rejected (service error status 409). All 4 passed, 0 failed, 0 skipped. [Service test screenshot](evidence/2026-11-19-0926cf7-service-tests-pass.png).
- Manual endpoint: `POST http://localhost:5000/api/attendance/clock-out`, using `x-demo-firebase-uid`. M01 UID 001 first request: 200, OUT, `2026-11-19T07:30:38.228Z`; M02 repeat: 409, `You are not currently clocked in.`; M03 UID 002 first request: 200, OUT, `2026-11-19T07:39:17.776Z`; M04 repeat: 409, same message; M05 unknown `invalid-uid`: 404, `Employee not found.`; M06 missing header: 401, `Authentication required.` All 6 passed. [Manual results](evidence/2026-11-19-0926cf7-manual-api-results.txt) are a transcription of reported results, not an original terminal capture; [EMP001 Postman screenshot](evidence/2026-11-19-0926cf7-clock-out-emp001-pass.png).
- Health check, separate from functional tests: `GET /api/health` returned 200 (1 Pass); [browser](evidence/2026-11-19-0926cf7-health-browser.png) and [Postman](evidence/2026-11-19-0926cf7-health-postman.png) screenshots show the health check. `GET /` returned `Cannot GET /`; a root route is not required and this is not a confirmed bug.
- Blocked checks (3, not executed): B01 real Firebase token verification, because it is not implemented; B02 Google Sheets persistence, because storage is in memory; B03 actual frontend/backend integration, pending integration.
- Not Run checks (7, not executed): N01 integrated active-staff validation; N02 persistent OUT status; N03 Team 2 clock-in integration; N04 concurrent duplicate prevention; N05 agreed API contract verification; N06 post-integration regression; N07 final code review and approval. These are outstanding checks, not additional executed tests.
- Diagnostic observation: Postman displayed HTTP 409 with a stale-looking success body; subsequent cURL returned the correct error body. The cause is unconfirmed, not a confirmed backend defect. [Postman observation](evidence/2026-11-19-0926cf7-postman-duplicate-display-observation.png). Demo authentication and service error formats differ; verify the agreed contract before judging conformity.
- Demo UID middleware is not real authentication. In-memory results do not establish persistence or end-to-end operation.

## QA Sign-off
- Status: Pending
- Tested version: `0926cf753e474531480342f049ee92689a97b1b9`
- QA: Adam Jattiem
- Date: Pending
- Decision: Khanya's standalone subtasks passed preliminary testing within the demo environment; no fixes are currently required for the tested scenarios. Khanya can proceed with the remaining S1-10b subtasks assigned to Zaarah in coordination with her. Integrate the remaining functionality and retest before final sign-off. The ticket is not complete.

## QA Review History

### 19 November 2026 - Preliminary service and demo API testing
- Results and evidence are recorded above; final integrated acceptance, regression, code review and approval remain outstanding.
- Preliminary QA feedback was sent to Team 4 on 19 November 2026. Khanya was informed that no fixes were currently required for his tested subtasks and that he could proceed with the remaining S1-10b subtasks in coordination with Zaarah.
