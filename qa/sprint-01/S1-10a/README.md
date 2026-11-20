# S1-10a - Develop the clock out functionality

## Ticket Information
- Category: Frontend development
- Due date: 19 November 2026
- Source: 18 November 2026 Slack project tracker export `Project_tracker(6).json`, as supplied by the QA tester; not live Slack verification.
- Sprint: 1
- Team: 4
- QA tester: Adam Jattiem
- Slack ticket: S1-10a in the [Slack project tracker](https://lifechoicesnpo.slack.com/lists/T02LW4RMXJQ/F0CG5PD0XB6); direct ticket link not recorded.
- Figma: [Clock-out wireframe](https://www.figma.com/design/Tlkxebvj6tGK2rqH57wFXN/Digital-Attendance-Tracking-System---Wireframe?node-id=99-194).
- Developers: Phumezile Sibeko and Elijah
- Feature branch: `frontend4-feature/s1-10a-clock-out`
- QA branch: `QA4`
- QA status: Fail - changes required

## Requirements
- User story: As a staff member, I want to clock out when I leave work so that my departure time is recorded.
- Context: Develop the clock-out interface that allows authenticated staff members to record when they leave work.

## Acceptance Criteria
- [ ] The employee can access the clock-out screen after authentication.
- [ ] The Clock Out button is displayed when the employee's status is IN.
- [ ] The frontend sends the clock-out request to the backend.
- [ ] A success message appears after the backend confirms the attendance record.
- [ ] Error messages appear if the request fails.
- [ ] The attendance status updates to OUT after successful clock-out.

## Definition of Done
- [ ] The clock-out interface has been developed according to the approved design.
- [ ] The employee's name and current attendance status are displayed correctly.
- [ ] The Clock Out button works correctly.
- [ ] The frontend is successfully connected to the backend clock-out API.
- [ ] Loading, success and error messages are displayed correctly.
- [ ] The attendance status updates to OUT after successful clock-out.
- [ ] The interface has been tested on mobile and desktop.
- [ ] All identified frontend bugs have been resolved.
- [ ] Code has been reviewed and approved.

## Out of Scope
- Not specified in the exported ticket.

## Dependencies
- S1-08 approved design.
- S1-10b clock-out backend.
- Team 2 clock-in functionality.
- Shared API contract.

## Subtasks

| ID | Description | Primary Slack assignee | Sprint Brief collaborators | QA Status | Report |
|---|---|---|---|---|---|
| ST-01 | Clock-out screen | Phumezile Sibeko | None recorded | Fail - design conformity | [Report](ST-01-clock-out-screen.md) |
| ST-02 | Employee name and attendance status | Phumezile Sibeko | None recorded | Fail - unexpected-state handling; live data Blocked | [Report](ST-02-employee-name-and-status.md) |
| ST-03 | Clock-out button and loading state | Elijah | None recorded | Fail - loading and styling; integration passed on prior build, current regression pending | [Report](ST-03-clock-out-button.md) |
| ST-04 | API connection | Elijah | Phumezile Sibeko and Sibongile | Fail - request implementation absent; live execution Blocked | [Report](ST-04-api-connection.md) |
| ST-05 | Success message | Elijah | None recorded | Blocked - mock success observed; backend-confirmed success unverified | [Report](ST-05-success-message.md) |
| ST-06 | Error messages | Elijah | None recorded | Fail - handling absent; runtime failure test not run | [Report](ST-06-error-messages.md) |
| ST-07 | Update attendance status | Elijah | None recorded | Pass on prior build; current regression pending; API verification Blocked | [Report](ST-07-update-status.md) |
| ST-08 | Mobile responsiveness | Elijah | Zaarah | Pass preliminary on prior build; broader/current checks outstanding | [Report](ST-08-mobile-responsiveness.md) |

## Linked Bugs
- [BUG-S1-10a-01](bugs/BUG-S1-10a-01-screen-design.md) - Open; screen still differs from the supplied coloured Figma reference (Phumezile Sibeko, Medium proposed).
- [BUG-S1-10a-02](bugs/BUG-S1-10a-02-attendance-fallback.md) - Partially resolved; OUT message improved, unexpected status handling remains (Phumezile Sibeko, Medium proposed).
- [BUG-S1-10a-03](bugs/BUG-S1-10a-03-button-integration.md) - Fixed in source and verified on prior runtime build; current-build regression pending (Elijah, High proposed).
- [BUG-S1-10a-04](bugs/BUG-S1-10a-04-button-design.md) - Open; button styling still differs (Elijah, Medium proposed).
- [BUG-S1-10a-05](bugs/BUG-S1-10a-05-state-setter.md) - Fixed in source and verified on prior runtime build; current-build regression pending (Elijah, High proposed).
- [BUG-S1-10a-06](bugs/BUG-S1-10a-06-loading-state.md) - Open; required loading feedback is absent (Elijah, Medium proposed).
- [BUG-S1-10a-07](bugs/BUG-S1-10a-07-error-handling.md) - Open; required operation failure feedback is absent (Elijah, High proposed).
- [BUG-S1-10a-08](bugs/BUG-S1-10a-08-api-integration.md) - Open; no clock-out API request implementation exists. Confirm sprint acceptance scope with Scrum Masters (Elijah, High proposed).

Severity levels are proposed QA classifications. Scrum Masters verbally confirmed mock data can be used for ticket passage. This does not make mock data a defect or prove that the explicit API connection criterion was waived. Mock behavior and real integration are tracked separately; API verification remains blocked/deferred until scope and backend availability are resolved. Original acceptance criteria and Definition of Done remain unchanged.

## Testing Summary
- Original test cases: 13. Primary status per case: 4 Pass, 6 Fail, 3 Blocked, 0 Not Run. Each original test ID appears once in the current status tables; dated history below records earlier outcomes and pending retests separately.
- Pass (4): ST-01 TC-01; ST-03 TC-01 (mock integration, f998ab2); ST-07 TC-01 (local transition, f998ab2); ST-08 TC-01 (preliminary mobile, f998ab2 at 393 x 852). Prior-build passes do not establish current-build regression coverage.
- Fail (6): ST-01 TC-02 design; ST-02 TC-02 unexpected-state handling; ST-03 TC-02 missing loading (source finding; rapid-repeat runtime test not run) and TC-03 styling; ST-04 TC-01 missing API request implementation (source-confirmed); ST-06 TC-01 missing error handling (source-confirmed; runtime failure test not run).
- Blocked (3): ST-02 TC-01 live-data verification; ST-05 TC-01 backend-confirmed success (mock feedback was observed); ST-07 TC-02 API-backed status verification.
- The totals describe the latest primary disposition of each original test case. Source findings are not described as executed runtime failures. Mock-only observations, historical passes, current-build regression gaps and blocked live checks are stated in the individual reports.
- On 19 November, commit `f998ab224f8a83152be733ffbb791079a50869d3` ran with Vite 8.3.8. Environment checks and dependency installation passed with zero reported vulnerabilities. The page rendered; clicking Clock Out changed local status IN to OUT, displayed the time, and disabled the button. No Fetch/XHR request was observed. Refresh reset status to IN and removed the time. This confirms mock-only, in-memory behavior. The independent ChatGPT Work reproduction is recorded as corroboration; it captured no screenshots and did not complete the full retest.
- On 20 November, commit `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3` (`added styling to sections`) was checked out in a clean testing worktree, detached from HEAD; QA4 remained separate. Environment files were ignored/untracked and absent at the three checked `.env` paths. Vite rendered at `http://127.0.0.1:5173/`. Dark header, teal background, dark card and lime button were present. Remaining design gaps: approved logo, green employee name and status badge, button text/triangle colours, information message/icon, and clock icon. Source review found the name span uses `clockout-h1` as an attribute instead of `className="clockout-h1"`. Clock-out logic was unchanged from f998ab2.
- A separate automated attempt reported build and lint passed, but logs are unavailable, so these are reported results only. Chromium could not launch because socket creation was denied. Current-build interactive, network, error and responsive automation did not execute. A browser harness failure is not an application defect.
- Scrum Masters verbally clarified mock-data allowance. Mock-data tests may pass when their stated expected results are met; this does not establish live integration or waive the explicit API acceptance criterion. Coloured reference approval was not independently verified; distinguish it from the earlier grayscale wireframe.
- Evidence: preserved [18 Nov expected Figma image](evidence/2026-11-18-clock-out-figma-expected.png) and [18 Nov actual image at d7fb9f8](evidence/2026-11-18-d7fb9f8-clock-out-actual.png). Screenshots from the 19-20 November sessions were not retained. Findings are based on manual observations and source review. Build/lint results are recorded as reported without independently verified logs. Fresh evidence will be collected during future retesting.
- Prepared developer feedback (not sent): Phumezile/ST-01 complete Figma styling; fix `clockout-h1` to `className`; add logo, badge, clock icon and correct information message. ST-02 structure mock employee data, handle IN/OUT/unexpected values explicitly, and show accurate messages. Elijah/ST-03 correct button text/icon colours, add loading/disabled behavior and prevent duplicate submissions. ST-04 introduce an async mock service, coordinate real API work and clarify sprint integration scope. ST-05 show success only after operation completes. ST-06 show errors, keep status unchanged on failure, permit retry, and use `try/catch/finally` as suitable. ST-07 update only after successful clock-out; add mock persistence only if required and coordinate with Zaarah about S1-15 dummy service. ST-08 complete responsive checks with Zaarah and fix confirmed layout issues.
- Retest plan: current-build visual and interaction regressions, including rapid clicks, loading, refresh behavior and responsive layout; run API, confirmed success and failure cases when the endpoint and agreed scope are available. Preserve original acceptance criteria and Definition of Done.

## QA Sign-off
- Status: Pending
- Tested versions: `f998ab224f8a83152be733ffbb791079a50869d3` (runtime, 19 Nov); `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3` (render/visual, 20 Nov)
- QA: Adam Jattiem
- Date: Pending
- Notes: Fail - changes required. Current-build regression and remaining acceptance checks are outstanding; final sign-off pending.

## QA Review History

### 17 November 2026 - Preliminary static code review and environment setup
- QA tester: Adam Jattiem.
- Developer: Phumezile Sibeko.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Reviewed commit: `26f65d5d218a8ce4736151cdc7637b15568d049c`.
- Environment: Windows, local detached Git worktree, React and Vite.
- Dependency installation: Successful; 176 packages installed and zero reported vulnerabilities.
- Outcome: Clock-out page structure and App.jsx connection reviewed. Whether the page matches the approved Ticket 8 design has not been verified. Employee name and attendance status currently use placeholder data; testing with live data awaits API availability.
- Preliminary finding: The clocked-out and unexpected-status fallback messaging is inaccurate; see ST-02. Verification and retesting remain outstanding.
- Development handoff: Elijah can continue development on the shared feature branch `frontend4-feature/s1-10a-clock-out`.
- Formal tests were not run. Final QA approval is pending.

### 18 November 2026 - Runtime visual review and static code review
- QA tester: Adam Jattiem.
- Developers: Phumezile Sibeko and Elijah.
- Ticket: S1-10a. Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Tested commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Previous tested commit: `26f65d5d218a8ce4736151cdc7637b15568d049c`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8. Local URL: `http://localhost:5173/`.
- Design reference: [Figma clock-out wireframe](https://www.figma.com/design/Tlkxebvj6tGK2rqH57wFXN/Digital-Attendance-Tracking-System---Wireframe?node-id=99-194).
- Retrieved Elijah's commit into the existing detached testing worktree; QA4 remained separate and unaffected. Started the Vite development server successfully and confirmed the clock-out page renders.
- Compared the running page screenshot with the supplied Figma wireframe. TC-01 passed for page rendering and connection; TC-02 failed for design conformity. The observed mismatches and static findings are detailed in ST-01 through ST-07.
- Reviewed `ClockOutPage.jsx`, `StatusCard.jsx`, `Clockout.jsx`, and `Clockout.css`. The rendered button's loading, disabled, click, and repeated-click behavior was not exercised. Loading and repeated-click behavior were not tested.
- Placeholder employee name, Clocked In status, and Since 08:15 were visible as mock data. This is a successful visual observation only; testing with live data remains Blocked.
- End-to-end testing through the API is Blocked until the backend is available. Success/error feedback and mobile viewport testing were Not Run.
- Evidence screenshots are linked from ST-01 and the design-related bug reports. They establish visual discrepancies only.
- Proposed bug severities are QA classifications. Developer feedback was sent to Phumezile Sibeko and Elijah via Slack on 18 November 2026, as confirmed by the QA tester; message URL and time were not recorded.
- Overall ticket QA status: Fail - changes required. Final QA sign-off: Pending.

### 19 November 2026 - Runtime testing
- Tested `f998ab224f8a83152be733ffbb791079a50869d3`; manual observations are summarized above and traced in ST-01, ST-02, ST-03 and ST-07. No S1-10a screenshot or log was saved.

### 20 November 2026 - Styling update review
- Tested `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3` (`added styling to sections`). Worktree was clean and detached; QA4 was separate. Vite rendered at `http://127.0.0.1:5173/`; visual changes and open design defects are summarized above and in ST-01/ST-03. Build/lint results are reported, without located logs. Automated browser tests were blocked by Chromium socket creation denial. No screenshot was captured.
