# ST-06 - Status Component Design

## Information
- Ticket ID: S1-15
- Assigned developer: Not confirmed.
- Current QA status: Preliminary developer result recorded; independent QA Not Run.

## Objective
- Match attendance status cards to the applicable Figma design.

## Acceptance Criteria
- [ ] Card dimensions, layout and visual treatment match the design.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Compare the clocked-out and clocked-in cards with Figma. | Card dimensions, layout and visual treatment match the design. | Fail reported; independent QA Not Run. |

## Linked Bugs
- [BUG-S1-15-03](bugs/bug-s1-15-03-reported.md)
- [BUG-S1-15-04](bugs/bug-s1-15-04-reported.md)

## Testing History

### Preliminary developer testing - date and build not recorded
- Tester and finding source: Zaarah (Fullstack Developer). These are Zaarah?s reported observations, not independent QA results.
- Test case ID: TC-01
- Branch: Not recorded.
- Commit SHA: Not recorded.
- Environment/browser/device: Not recorded.
- Preconditions/reproduction steps: Not recorded; no steps were supplied.
- Expected result: Card dimensions, layout and visual treatment match the design.
- Reported actual result: Zaarah reported incorrect card dimensions/design. Clocked-in card also needs matching design details.
- Reported result: Fail reported; independent QA Not Run.
- Independent QA result: Not Run.
- Evidence: Not provided; no screenshots or logs supplied.
- Retest: Adam to reproduce independently after relevant changes; record tested build and evidence then.


### 20 November 2026 - QA source review (not runtime test)
- Reviewer: Adam Jattiem. Source branch: `frontend4-feature/s1-15-attendance-status`. Reviewed commit: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; compared with `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Evidence type: Git diff and source inspection. No browser, device, command output, screenshot or runtime test was recorded.
- Finding: Latest source changes card CSS, colours, padding, spacing, typography and checkmark assets. Dimensions and alignment have not been measured against Figma; source changes do not prove visual conformity.
- Result: Source review only; independent runtime QA Not Run.
- Required follow-up: Compare dimensions, padding, spacing, typography, alignment, radius, colors and approved decoration against Figma; verify desktop/mobile and ensure CSS is component-scoped.
