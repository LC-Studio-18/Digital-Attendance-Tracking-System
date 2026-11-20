# ST-01 - Status Persistence

## Information
- Ticket ID: S1-15
- Assigned developer: Not confirmed.
- Current QA status: Preliminary developer result recorded; independent QA Not Run.

## Objective
- Verify attendance status remains correct after refresh.

## Acceptance Criteria
- [ ] Persistence requirement: current status remains correct after page refresh.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Refresh while clocked in and verify attendance status remains unchanged. | Persistence requirement: current status remains correct after page refresh. | Reported Pass; independent QA Not Run. |

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
- Expected result: Persistence requirement: current status remains correct after page refresh.
- Reported actual result: Status unchanged after refresh was reported by Zaarah. Underlying persistence mechanism is not verified.
- Reported result: Reported Pass; independent QA Not Run.
- Independent QA result: Not Run.
- Evidence: Not provided; no screenshots or logs supplied.
- Retest: Adam to reproduce independently after relevant changes; record tested build and evidence then.


### 20 November 2026 - QA source review (not runtime test)
- Reviewer: Adam Jattiem. Source branch: `frontend4-feature/s1-15-attendance-status`. Reviewed commit: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; compared with `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Evidence type: Git diff and source inspection. No browser, device, command output, screenshot or runtime test was recorded.
- Finding: Source review on `5d68b59d1503448b4f8d370d7e22d92cd9edf51b` shows the mock attendance service reads and writes browser `localStorage`. This confirms mock persistence implementation by source inspection only. Zaarah reported refresh persistence, but original timestamps, repeated cycles, malformed storage and storage loss have not been independently tested. Production backend persistence remains unverified.
- Result: Source review only; independent runtime QA Not Run.
- Required follow-up: Review localStorage event parsing and isolated key use; test IN/OUT refresh cycles, unchanged timestamps, malformed/unavailable storage, without clearing unrelated data. Backend verification required for full completion.
