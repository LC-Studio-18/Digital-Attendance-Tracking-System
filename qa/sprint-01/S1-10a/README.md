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
| ST-01 | Clock-out screen | Phumezile Sibeko | None recorded | Fail | [Report](ST-01-clock-out-screen.md) |
| ST-02 | Employee name and attendance status | Phumezile Sibeko | None recorded | Fail for static fallback review; live-data verification Blocked | [Report](ST-02-employee-name-and-status.md) |
| ST-03 | Clock-out button and loading state | Elijah | None recorded | Fail - component integration | [Report](ST-03-clock-out-button.md) |
| ST-04 | API connection | Elijah | Phumezile Sibeko and Sibongile | Blocked pending backend availability | [Report](ST-04-api-connection.md) |
| ST-05 | Success message | Elijah | None recorded | Not Run | [Report](ST-05-success-message.md) |
| ST-06 | Error messages | Elijah | None recorded | Not Run | [Report](ST-06-error-messages.md) |
| ST-07 | Update attendance status | Elijah | None recorded | Fail for static logic; API end-to-end Blocked | [Report](ST-07-update-status.md) |
| ST-08 | Mobile responsiveness | Elijah | Zaarah | Not Run | [Report](ST-08-mobile-responsiveness.md) |

## Linked Bugs
- [BUG-S1-10a-01](bugs/BUG-S1-10a-01-screen-design.md) - Clock-out screen does not match the Figma wireframe (Phumezile Sibeko, Medium, Open).
- [BUG-S1-10a-02](bugs/BUG-S1-10a-02-attendance-fallback.md) - Incorrect attendance fallback messaging (Phumezile Sibeko, Medium, Open; static finding pending runtime verification).
- [BUG-S1-10a-03](bugs/BUG-S1-10a-03-button-integration.md) - Clock-out button not integrated into the page (Elijah, High, Open).
- [BUG-S1-10a-04](bugs/BUG-S1-10a-04-button-design.md) - Clock-out button design discrepancies (Elijah, Medium, Open).
- [BUG-S1-10a-05](bugs/BUG-S1-10a-05-state-setter.md) - Attendance state setter never called (Elijah, High, Open; static finding pending runtime verification).

Severity levels are proposed QA classifications.

## Testing Summary
- Test cases (13 total): 1 Pass, 5 Fail, 3 Blocked, 4 Not Run. ST-02 TC-01 is Blocked for live-data verification; the visible mock-data display was separately observed successfully and is not counted as a passed live-data test.
- Visual testing: The clock-out page rendered. Its appearance did not match the supplied Figma wireframe.
- Static code review: Identified button integration, attendance fallback, and state-update issues. The reports distinguish these findings from results observed while the application was running.
- Blocked: Live employee data and API-backed end-to-end behavior await the backend/API.
- Not Run: Success feedback, error feedback, interactive loading/repeated-click behavior, and mobile viewport testing.
- Future acceptance testing includes authenticated access and verifying the button is shown for IN status; neither is established by the existing placeholder screenshot. Verify live employee data and fallback states, API-backed clock-out and status updates, success and error feedback, loading and repeated clicks, mobile layout, and regression after fixes. These are outstanding checks, not additional test cases.
- Tested developer commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Previous tested commit: `26f65d5d218a8ce4736151cdc7637b15568d049c` (17 November 2026).
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; local URL `http://localhost:5173/`.
- Evidence: [Expected Result — Figma wireframe](evidence/2026-11-18-clock-out-figma-expected.png); [Actual Result — running application at commit d7fb9f8](evidence/2026-11-18-d7fb9f8-clock-out-actual.png). Screenshots show visual appearance only, not interaction or attendance state changes.
- QA tester confirmed developer feedback was sent to Phumezile Sibeko and Elijah via Slack on 18 November 2026; no message URL or time was recorded. Developer fixes and QA retesting are outstanding.

## QA Sign-off
- Status: Pending
- Tested version: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`
- QA: Adam Jattiem
- Date: Pending
- Notes: Developer fixes and QA retesting remain outstanding.

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
