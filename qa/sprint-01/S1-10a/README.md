# S1-10a - Clock-Out Frontend

## Ticket Information
- Sprint: 1
- Team: 4
- Developers: Phumezile Sibeko and Elijah
- Feature branch: `frontend4-feature/s1-10a-clock-out`
- QA branch: `QA4`
- QA status: Fail - changes required

## Requirements
- Implement the approved clock-out interface.
- Display employee name and attendance status.
- Connect the clock-out action to the backend API.
- Display loading, success and error states.
- Update attendance status after successful clock-out.

## Acceptance Criteria
- [ ] Interface matches the approved design.
- [ ] Eligible employees can clock out.
- [ ] Loading state works correctly.
- [ ] Success and error messages display correctly.
- [ ] Attendance status changes to OUT after success.
- [ ] Interface works on mobile devices.

## Dependencies
- S1-08 approved design.
- S1-10b clock-out backend.
- Team 2 clock-in functionality.
- Shared API contract.

## Subtasks

| ID | Description | Assigned developer | QA Status | Report |
|---|---|---|---|---|
| ST-01 | Clock-out screen | Phumezile Sibeko | Fail | [Report](ST-01-clock-out-screen.md) |
| ST-02 | Employee name and attendance status | Phumezile Sibeko | Blocked for live-data testing | [Report](ST-02-employee-name-and-status.md) |
| ST-03 | Clock-out button and loading state | Elijah | Fail - component integration | [Report](ST-03-clock-out-button.md) |
| ST-04 | API connection | Elijah | Blocked pending backend availability | [Report](ST-04-api-connection.md) |
| ST-05 | Success message | Elijah | Not Run | [Report](ST-05-success-message.md) |
| ST-06 | Error messages | Elijah | Not Run | [Report](ST-06-error-messages.md) |
| ST-07 | Update attendance status | Elijah | Fail for static logic; API end-to-end Blocked | [Report](ST-07-update-status.md) |
| ST-08 | Mobile responsiveness | Phumezile Sibeko | Not Run | [Report](ST-08-mobile-responsiveness.md) |

## Linked Bugs
- [BUG-S1-10a-01](bugs/BUG-S1-10a-01-screen-design.md) - Clock-out screen does not match Figma wireframe (Phumezile Sibeko, Medium, Open).
- [BUG-S1-10a-02](bugs/BUG-S1-10a-02-attendance-fallback.md) - Incorrect attendance fallback messaging (Phumezile Sibeko, Medium, Open; static finding pending runtime verification).
- [BUG-S1-10a-03](bugs/BUG-S1-10a-03-button-integration.md) - Clock-out button not integrated into the page (Elijah, High, Open).
- [BUG-S1-10a-04](bugs/BUG-S1-10a-04-button-design.md) - Clock-out button design discrepancies (Elijah, Medium, Open).
- [BUG-S1-10a-05](bugs/BUG-S1-10a-05-state-setter.md) - Attendance state setter never called (Elijah, High, Open; static finding pending runtime verification).

Severity levels are proposed QA classifications.

## Testing Summary
- Test cases (12 total): 1 Pass, 5 Fail, 3 Blocked, 3 Not Run. ST-02 TC-01 is Blocked for live-data verification; the visible mock-data display was separately observed successfully and is not counted as a passed live-data test.
- Visual testing: Clock-out page renders; screen was compared with the supplied Figma wireframe and failed design conformity.
- Static code review: Identified button integration, attendance fallback, and state-update issues. These findings are distinguished from runtime results in their reports.
- Blocked: Live employee data and API-backed end-to-end behavior await backend/API availability.
- Not Run: Success feedback, error feedback, interactive loading/repeated-click behavior, and mobile viewport testing.
- Tested developer commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Previous tested commit: `26f65d5d218a8ce4736151cdc7637b15568d049c` (17 November 2026).
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; local URL `http://localhost:5173/`.
- Evidence: [Expected Result — Figma wireframe](evidence/2026-11-18-clock-out-figma-expected.png); [Actual Result — running application at commit d7fb9f8](evidence/2026-11-18-d7fb9f8-clock-out-actual.png). Screenshots show visual appearance only, not interaction or attendance state changes.
- Developer feedback has been prepared. No Slack message is claimed as sent.

## QA Sign-off
Pending. Final QA sign-off remains pending changes and retesting.

## QA Review History

### 17 November 2026 - Preliminary static code review and environment setup
- QA tester: Adam Jattiem.
- Developer: Phumezile Sibeko.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Reviewed commit: `26f65d5d218a8ce4736151cdc7637b15568d049c`.
- Environment: Windows, local detached Git worktree, React and Vite.
- Dependency installation: Successful; 176 packages installed and zero reported vulnerabilities.
- Outcome: Clock-out page structure and App.jsx connection reviewed. Final conformity with the approved Ticket 8 design remains unverified. Employee name and attendance status currently use placeholder data; dynamic-data testing awaits API availability.
- Preliminary finding: The clocked-out and unexpected-status fallback messaging is inaccurate; see ST-02. Verification and retesting remain outstanding.
- Development handoff: Elijah can continue development on the shared feature branch `frontend4-feature/s1-10a-clock-out`.
- Formal test status: Not Run. Final QA approval: Pending.

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
- Reviewed `ClockOutPage.jsx`, `StatusCard.jsx`, `Clockout.jsx`, and `Clockout.css`. The rendered button's loading, disabled, click, and repeated-click behavior was not exercised. No interactive loading or repeated-click tests are claimed.
- Placeholder employee name, Clocked In status, and Since 08:15 were visible as mock data. This is a successful visual observation only; live-data testing remains Blocked.
- API-backed end-to-end testing is Blocked pending backend availability. Success/error feedback and mobile viewport testing were Not Run.
- Evidence screenshots are linked from ST-01 and the design-related bug reports. They establish visual discrepancies only.
- Proposed bug severities are QA classifications. Developer feedback has been prepared; no Slack message is claimed as sent.
- Overall ticket QA status: Fail - changes required. Final QA sign-off: Pending.
