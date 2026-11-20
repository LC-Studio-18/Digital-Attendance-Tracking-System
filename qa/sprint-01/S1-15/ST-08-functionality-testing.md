# ST-08 - Functionality Testing

## Information
- Ticket ID: S1-15
- Assigned developer: Not confirmed.
- Current QA status: Preliminary developer result recorded; independent QA Not Run.

## Objective
- Verify status display behavior across attendance states.

## Acceptance Criteria
- [ ] Correct messages appear for daily attendance conditions, including whether the employee has clocked in.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Check the attendance-not-recorded message for a not-yet-clocked-in employee and a clocked-out employee. | Correct messages appear for daily attendance conditions, including whether the employee has clocked in. | Further verification required; not counted Pass or Fail. Independent QA Not Run. |

## Linked Bugs
None recorded.

## Testing History

### Preliminary developer testing - date and build not recorded
- Tester and finding source: Zaarah (Fullstack Developer). These are Zaarah?s reported observations, not independent QA results.
- Test case ID: TC-01
- Branch: Not recorded.
- Commit SHA: Not recorded.
- Environment/browser/device: Not recorded.
- Preconditions/reproduction steps: Not recorded; no steps were supplied.
- Expected result: Correct messages appear for daily attendance conditions, including whether the employee has clocked in.
- Reported actual result: Zaarah said ?Your attendance hasn?t been recorded for today? should appear only if the employee has not clocked in that day. Observed conditional behavior was not described.
- Reported result: Further verification required; not counted Pass or Fail. Independent QA Not Run.
- Independent QA result: Not Run.
- Evidence: Not provided; no screenshots or logs supplied.
- Retest: Adam to reproduce independently after relevant changes; record tested build and evidence then.


### 20 November 2026 - QA source review (not runtime test)
- Reviewer: Adam Jattiem. Source branch: `frontend4-feature/s1-15-attendance-status`. Reviewed commit: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; compared with `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Evidence type: Git diff and source inspection. No browser, device, command output, screenshot or runtime test was recorded.
- Finding: The earlier conditional daily message requirement and clock-in/out scenarios remain untested independently. Prior ChatGPT-assisted checks are described in the ticket README only and are not QA results.
- Result: Source review only; independent runtime QA Not Run.
- Required follow-up: Expand tests for IN/OUT/empty, previous-day/overnight, conditional messages, actions/timestamps, persistence/storage faults, repeats/failures, loading/flash, retrieval/retry, time/design, desktop/mobile.
