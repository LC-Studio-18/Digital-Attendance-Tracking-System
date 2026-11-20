# ST-08 - Mobile Responsiveness

## Information
- Ticket ID: S1-10a
- Primary Slack assignee: Elijah; collaborator: Zaarah.
- Current QA status: Fail: 393 x 852 rendered (7.1), but overlap, horizontal scrolling, clipped text and unusable buttons were reported (7.2-7.5). Exact elements and further reproduction details/screenshots are pending.

## Objective
- Verify mobile responsiveness.

## Acceptance Criteria
- [ ] See original ticket acceptance criteria and Definition of Done in [S1-10a README](README.md).

## Test Cases

| Test ID | Scenario | Expected Result | Primary Status and Notes |
|---|---|---|---|
| TC-01 | Inspect clock-out screen at mobile viewport sizes | Layout and controls remain usable | Pass - preliminary f998ab2 check at 393 x 852; broad/current-build checks remain outstanding. |

## Linked Bugs
None recorded.

## Testing History
### 18 November 2026 - Review status
- Tester: Adam Jattiem. Commit: `d7fb9f83f8f47d4f2e001097fbfa20fccc760ce0`.
- No mobile viewport testing was performed. TC-01 remains Not Run.

#### Additional history fields
- Test case ID: TC-01.
- Developer branch: `frontend4-feature/s1-10a-clock-out`.
- Environment: Windows, detached Git worktree, React, Vite 8.3.8; browser and device not recorded.
- Preconditions: Mobile viewport test not performed.

#### Steps to Reproduce
1. No mobile viewport test steps were performed.

#### Expected Result
- The interface remains usable on mobile viewports.

#### Actual Result
- Not tested.

#### Result
- TC-01 Not Run.

#### Bug Reference
- None recorded.

#### Evidence
- No mobile test evidence recorded.

#### Notes
- Test mobile viewport sizes after fixes.


### 19 November 2026 - Preliminary mobile observation
- On `f998ab224f8a83152be733ffbb791079a50869d3`, preliminary manual inspection at 393 x 852 showed a usable layout. No screenshot was saved and no other viewport was tested. This is not current-build or broad responsive coverage.
- Prepared feedback, not sent: Elijah to complete responsive verification with Zaarah and correct confirmed layout issues. QA will check agreed mobile and desktop sizes after styling changes. No new mobile defect is confirmed.


### 20 November 2026 - Zaarah Okkers retest
- Tester: Zaarah Okkers; tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`. Dummy-data frontend only; authentication and API connectivity were not tested.
- Fail: 393 x 852 rendered (7.1), but overlap, horizontal scrolling, clipped text and unusable buttons were reported (7.2-7.5). Exact elements and further reproduction details/screenshots are pending.
- Evidence: supplied tester report; session screenshots/logs pending. See [complete session](2026-11-20-zaarah-testing.md). Real integration is mandatory for S1-10a approval.
