# ST-02 - Employee Name and Attendance Status

## Information
- Ticket ID: S1-10a
- Assigned developer: Phumezile Sibeko
- Current QA status: Not Run

## Objective
- Display the employee name and attendance status on the clock-out page.

## Acceptance Criteria
- [ ] Employee name is displayed from dynamic employee data.
- [ ] Attendance status is displayed accurately for supported states.
- [ ] Clocked-out and unexpected statuses receive accurate handling and messaging.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Verify employee name and attendance status with API data | Current employee information and status display accurately | Blocked |
| TC-02 | Review clocked-out and unexpected-status handling | Messages accurately describe the employee's attendance state | Not Run |

## Linked Bugs
- Preliminary code-review finding: Clocked-out and unexpected attendance statuses use an inaccurate fallback message. Requires verification and retesting; not yet confirmed through runtime testing.

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
