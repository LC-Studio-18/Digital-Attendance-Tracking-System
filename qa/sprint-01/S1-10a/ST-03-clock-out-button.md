# ST-03 - Clock-Out Button and Loading State

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah.
- Current QA status: Partial: confirmation cancel/yes, rapid clicks, local duplicate prevention and disabled state passed (2.1-2.2, 3.1-3.2); loading missing (3.3). Desktop button styling passed tested reference (3.4); Wendy confirmation pending.

## Objective
- Integrate the clock-out button and provide loading and disabled behavior.

## Acceptance Criteria
- [ ] See original ticket acceptance criteria and Definition of Done in [S1-10a README](README.md).

## Test Cases

| Test ID | Scenario | Expected Result | Primary Status and Notes |
|---|---|---|---|
| TC-01 | Verify button integration and rendered page | Integrated actionable button works | Pass - verified on prior runtime build f998ab2; current-build regression pending. |
| TC-02 | Exercise loading, disabled and rapid-repeat behavior | Show pending feedback and prevent duplicate submissions | Fail - source review confirms loading state absent; rapid-repeat runtime test not run. |
| TC-03 | Compare button with supplied design | Text and icon colors match the reference | Fail - differences observed on 3c12382. |

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


### 19 November 2026 - Prior-build runtime
- On `f998ab224f8a83152be733ffbb791079a50869d3`, Clock Out changed local status IN to OUT, displayed the clock-out time and disabled the button. No Fetch/XHR request was observed. Rapid repeated-click behavior was not independently completed. This verifies a mock/local path only, not backend integration. Component integration and local disabled behavior passed on that build. No screenshot/log saved.

### 20 November 2026 - Current-build visual review
- On `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3`, the lime button rendered, but text and triangle colors differed from the supplied design. TC-03 Fail. Current-build interaction and rapid-repeat behavior were not exercised (TC-01 regression and TC-02 Not Run).
- Prepared feedback, not sent: Elijah to correct text/icon colors, add visible loading and disabled behavior, and prevent duplicate submissions. QA will test pending state and rapid clicks on the updated build.


### 20 November 2026 - Zaarah Okkers retest
- Tester: Zaarah Okkers; tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Dummy-data frontend only; authentication and API connectivity were not tested.
- Partial: confirmation cancel/yes, rapid clicks, local duplicate prevention and disabled state passed (2.1-2.2, 3.1-3.2); loading missing (3.3). Desktop button styling passed tested reference (3.4); Wendy confirmation pending.
- Evidence: supplied tester report; session screenshots/logs pending. See [complete session](2026-11-20-zaarah-testing.md). Real integration is mandatory for S1-10a approval.
