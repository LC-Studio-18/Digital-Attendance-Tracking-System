# ST-01 - Clock-Out Screen

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Phumezile Sibeko (18 November tracker export `Project_tracker(6).json`, as supplied).
- Additional Sprint Brief collaborators: None recorded.
- Current QA status: Fail

## Objective
- Provide the clock-out page and connect it to the application entry point.

## Acceptance Criteria
- [x] Basic clock-out page structure is implemented; design conformity is assessed separately.
- [x] Page is connected to the application and renders.
- [ ] Page conforms to the approved Figma design.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Verify clock-out page rendering and application connection | Clock-out page renders and is reachable through the application | Pass |
| TC-02 | Compare page with supplied Figma clock-out wireframe | Page structure and visual styling conform to the design | Fail |

## Linked Bugs
- [BUG-S1-10a-01](bugs/BUG-S1-10a-01-screen-design.md) - Clock-out screen does not match the Figma wireframe.

## Testing History

### 17 November 2026 - Preliminary code review
- Tester: Adam Jattiem.
- Test case ID: TC-01, TC-02 (formal tests not run).
- Branch: `frontend4-feature/s1-10a-clock-out`.
- Commit SHA / Figma version: `26f65d5d218a8ce4736151cdc7637b15568d049c`.
- Environment: Windows, local detached Git worktree, React and Vite. Dependency installation succeeded (176 packages; zero reported vulnerabilities).
- Preconditions: Static code review and environment setup only.

#### Steps to Reproduce
1. Formal test steps were not performed; review was limited to static code inspection.

#### Expected Result
- Clock-out page structure is implemented and connected to the application.
- Final page conforms to the approved Ticket 8 design.

#### Actual Result
- Clock-out page structure was implemented correctly and the page is connected to the application.
- Final conformity with the approved design remains unverified.

#### Result
Not Run

#### Bug Reference
None.

#### Evidence
- No browser testing or screenshots recorded.

#### Notes
- Static review does not establish runtime behavior or design conformity. Formal test status remains Not Run.

### 18 November 2026 - Visual runtime test
- Tester: Adam Jattiem.
- Test case ID: TC-01, TC-02.
- Branch: QA4 documentation branch; developer source retrieved from `frontend4-feature/s1-10a-clock-out` into the existing detached testing worktree.
- Commit SHA / Figma version: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`; [Figma clock-out wireframe](https://www.figma.com/design/Tlkxebvj6tGK2rqH57wFXN/Digital-Attendance-Tracking-System---Wireframe?node-id=99-194).
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; `http://localhost:5173/`.
- Preconditions: Vite development server started successfully.

#### Steps to Reproduce
1. Start the Vite development server in the detached testing worktree.
2. Open `http://localhost:5173/` and confirm the clock-out page renders.
3. Compare the rendered page screenshot with the supplied Figma clock-out wireframe.

#### Expected Result
- The page renders and its design matches the supplied wireframe.

#### Actual Result
- The page renders and is connected to the application (TC-01 Pass).
- Design conformity fails (TC-02 Fail). Header styling/alignment differs; the clock icon is missing; greeting and employee information are misplaced; typography, spacing, and alignment differ; current time is missing; date and greeting are hardcoded; vertical divider and attendance information icon are missing; status card position, background, rounded corners, and status indicator styling are incorrect or missing; attendance message position and spacing are incorrect; default Vite styling remains.

#### Result
TC-01 Pass; TC-02 Fail.

#### Bug Reference
- [BUG-S1-10a-01](bugs/BUG-S1-10a-01-screen-design.md) (proposed severity: Medium).

#### Evidence
- **Expected Result — Figma wireframe:** ![Expected Result — Figma wireframe](evidence/2026-11-18-clock-out-figma-expected.png)
- **Actual Result — running application at commit d7fb9f8:** ![Actual Result — running application at commit d7fb9f8](evidence/2026-11-18-d7fb9f8-clock-out-actual.png)
- The screenshots support visual comparison only; they do not evidence interactive behavior or attendance state changes.

#### Notes
- Related visual issues are grouped in one bug report. QA4 remained separate and unaffected during commit retrieval/testing.
- The hardcoded date and greeting were identified through source review. Dynamic updates are an inferred requirement requiring confirmation; the screenshots alone do not establish that behavior.
