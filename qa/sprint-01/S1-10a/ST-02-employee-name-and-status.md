# ST-02 - Employee Name and Attendance Status

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Phumezile Sibeko.
- Current QA status: Fail for unexpected-status handling; mock display passed; live-data check Blocked.

## Objective
- Display the employee name and attendance status on the clock-out page.

## Acceptance Criteria
- [ ] See original ticket acceptance criteria and Definition of Done in [S1-10a README](README.md).

## Test Cases

| Test ID | Scenario | Expected Result | Primary Status and Notes |
|---|---|---|---|
| TC-01 | Observe employee name and attendance status | Display mock values and verify live accuracy against employee data | Blocked - live-data check; mock display observed on f998ab2. |
| TC-02 | Check OUT and unexpected-status handling | Show accurate handling for both states | Fail - OUT message improved; unexpected-state handling remains incomplete by source review. |

## Linked Bugs
- [BUG-S1-10a-02](bugs/BUG-S1-10a-02-attendance-fallback.md) - Incorrect attendance fallback messaging (proposed severity: Medium; static finding pending runtime verification).

## Testing History

### 17 November 2026 - Preliminary code review
- Tester: Adam Jattiem.
- Test case ID: TC-01, TC-02 (formal runtime tests not run).
- Branch: `frontend4-feature/s1-10a-clock-out`.
- Commit SHA / Figma version: `26f65d5d218a8ce4736151cdc7637b15568d049c`.
- Environment: Windows, local detached Git worktree, React and Vite. Dependency installation succeeded (176 packages; zero reported vulnerabilities).
- Preconditions: Static code review and environment setup only; no API-backed employee data available for dynamic-data testing.

#### Steps to Reproduce
1. No runtime reproduction steps were performed. The behavior below is a preliminary code-review observation requiring verification and retesting.

#### Expected Result
- Employee name and attendance status reflect the current employee's dynamic information.
- A clocked-out employee is told accurately that they have already completed clock-out; unexpected values are handled distinctly or reported appropriately.

#### Actual Result
- Employee name and attendance status are implemented using placeholder data. Component structure and conditional rendering are appropriate, but dynamic employee information requires API integration.
- The clocked-out state incorrectly tells employees who have completed their workday that they have not clocked in and that attendance has not been recorded.
- Unexpected status values also fall into that same fallback state.

#### Result
Not Run

#### Bug Reference
- Preliminary code-review finding recorded above; verification and retesting required.

#### Evidence
- No browser testing or screenshots recorded.

#### Notes
- Dynamic-data testing is Blocked pending API availability. This is a preliminary code-review finding, not a confirmed runtime defect. Do not attribute incomplete functionality assigned to Elijah to Phumezile's work.

### 18 November 2026 - Mock-data visual observation and static code review
- Tester: Adam Jattiem.
- Test case ID: TC-01 (mock-data visual observation successful; live-data portion Blocked), TC-02 (static review Fail; runtime verification pending).
- Branch: QA4 documentation branch; developer source retrieved from `frontend4-feature/s1-10a-clock-out` into the existing detached testing worktree.
- Commit SHA / Figma version: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; `http://localhost:5173/`.
- Preconditions: Clock-out page rendered; backend/API was not available for live employee data.

#### Steps to Reproduce
1. Open the running clock-out page at `http://localhost:5173/`.
2. Observe the name and status presented by the current placeholder/mock data.
3. Inspect the reviewed code paths for clocked-out and unexpected attendance statuses.

#### Expected Result
- The displayed name, attendance status, and clock-in time come from current employee/API data.
- Clocked-out and unexpected statuses receive accurate handling and messages.

#### Actual Result
- Placeholder employee name, `Clocked In` status, and `Since 08:15` were visible: the mock-data display is a successful visual observation only.
- Live employee name, status, and clock-in time were not verified because API data was unavailable.
- Static code review found that employees who have already clocked out may incorrectly be told they have not clocked in; unexpected status values fall into the same fallback. This finding requires runtime verification.

#### Result
Mock-data visual observation: Pass. Live-data test: Blocked. Static fallback logic review: Fail, runtime verification pending.

#### Bug Reference
- [BUG-S1-10a-02](bugs/BUG-S1-10a-02-attendance-fallback.md) (proposed severity: Medium).

#### Evidence
- [Actual screenshot](evidence/2026-11-18-d7fb9f8-clock-out-actual.png) shows the placeholder employee name, Clocked In status and Since 08:15. It does not establish live-data accuracy or fallback behavior.

#### Notes
- Do not treat the mock-data observation as live-data testing or as a pass for API-backed acceptance criteria.


### 19 November 2026 - Prior-build runtime and source review
- Commit `f998ab224f8a83152be733ffbb791079a50869d3`. Displayed mock employee/status data; on clock-out, OUT messaging appeared. Live data was not available. Unexpected-status handling remains incomplete by source review. No screenshot saved.
- Expected: accurate structured employee data and distinct IN/OUT/unexpected messages. Actual: mock data displayed; live accuracy unverified; unexpected status handling incomplete. TC-01 mock portion Pass/live portion Blocked; TC-02 Fail for remaining handling.
- Prepared feedback, not sent: Phumezile to use structured mock employee information, explicitly handle IN/OUT/unexpected values and display accurate messages. QA will retest each state and live values when API data is available. Mock data itself is not a defect.
