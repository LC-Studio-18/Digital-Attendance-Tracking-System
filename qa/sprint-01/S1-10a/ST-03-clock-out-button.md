# ST-03 - Clock-Out Button and Loading State

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah (18 November tracker export `Project_tracker(6).json`, as supplied).
- Additional Sprint Brief collaborators: None recorded.
- Current QA status: Fail for component integration

## Objective
- Integrate the clock-out button and provide loading/disabled behavior.

## Acceptance Criteria
- [ ] Button matches the design and supports loading and disabled states.

## Test Cases
| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Inspect button integration and rendered page | Clockout component is rendered with an actionable button | Fail |
| TC-02 | Exercise loading, disabled, and repeated-click behavior | Loading/disabled states work and duplicate actions are prevented | Not Run |
| TC-03 | Compare button with supplied design | Button label and icon/design match reference | Fail |

## Linked Bugs
- [BUG-S1-10a-03](bugs/BUG-S1-10a-03-button-integration.md)
- [BUG-S1-10a-04](bugs/BUG-S1-10a-04-button-design.md)

## Testing History
### 18 November 2026 - Source review and rendered-page observation
- Tester: Adam Jattiem. Branch: `frontend4-feature/s1-10a-clock-out`. Commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; `http://localhost:5173/`.
- Inspected `ClockOutPage.jsx`, `Clockout.jsx`, and `Clockout.css`, and observed the rendered page.
- Expected: The integrated button uses the designed label/icon and supports loading and disabled states.
- Actual: `Clockout.jsx` and `Clockout.css` exist and contain loading/disabled logic, but `Clockout` is not imported or rendered by `ClockOutPage.jsx`. The rendered placeholder is labelled `Clock Out` and has no click handler. The unintegrated component label is `Clockout` instead of `Clock Out`, its icon is missing, and its design does not fully match the reference.
- Result: TC-01 Fail; TC-03 Fail; TC-02 Not Run. Interactive loading and repeated-click tests were not executed.
- Bugs: BUG-S1-10a-03 (High), BUG-S1-10a-04 (Medium), proposed QA severities.
- Evidence: Source inspection plus visual screenshots: [Expected Result — Figma wireframe](evidence/2026-11-18-clock-out-figma-expected.png); [Actual Result — running application at commit d7fb9f8](evidence/2026-11-18-d7fb9f8-clock-out-actual.png). Images support appearance comparison only, not button interaction, loading behavior, or attendance state changes.

#### Additional history fields
- Test case ID: TC-01, TC-02, TC-03.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; browser and device not recorded.
- Preconditions: Page running; source available for inspection.

#### Steps to Reproduce
1. Inspected ClockOutPage.jsx, Clockout.jsx and Clockout.css and compared the rendered page with Figma. Interactive tests were not performed.

#### Expected Result
- Button matches the design and supports loading and disabled states.

#### Actual Result
- See recorded actual and results above.

#### Result
- TC-01 Fail; TC-02 Not Run; TC-03 Fail.

#### Bug Reference
- BUG-S1-10a-03 and BUG-S1-10a-04

#### Evidence
- Source inspection and linked screenshots above.

#### Notes
- Screenshots show the placeholder, not the unintegrated component.
