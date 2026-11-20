# ST-05 - Loading, Empty and Error States

## Information
- Ticket ID: S1-15
- Assigned developer: Not confirmed.
- Current QA status: Preliminary developer result recorded; independent QA Not Run.

## Objective
- Show accurate loading, empty and error states.

## Acceptance Criteria
- [ ] Loading feedback is accurate and does not show a false attendance state. Empty and error states are handled.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Observe the status card while attendance status is loading. | Loading feedback is accurate and does not show a false attendance state. Empty and error states are handled. | Fail reported; independent QA Not Run. |

## Linked Bugs
- [BUG-S1-15-01](bugs/bug-s1-15-01-reported.md)
- [BUG-S1-15-02](bugs/bug-s1-15-02-reported.md)

## Testing History

### Preliminary developer testing - date and build not recorded
- Tester and finding source: Zaarah (Fullstack Developer). These are Zaarah?s reported observations, not independent QA results.
- Test case ID: TC-01
- Branch: Not recorded.
- Commit SHA: Not recorded.
- Environment/browser/device: Not recorded.
- Preconditions/reproduction steps: Not recorded; no steps were supplied.
- Expected result: Loading feedback is accurate and does not show a false attendance state. Empty and error states are handled.
- Reported actual result: ?Checking Status? appeared; the card temporarily showed Clocked Out or ?You haven?t clocked in yet? before Clocked In, as reported by Zaarah.
- Reported result: Fail reported; independent QA Not Run.
- Independent QA result: Not Run.
- Evidence: Not provided; no screenshots or logs supplied.
- Retest: Adam to reproduce independently after relevant changes; record tested build and evidence then.


### 20 November 2026 - QA source review (not runtime test)
- Reviewer: Adam Jattiem. Source branch: `frontend4-feature/s1-15-attendance-status`. Reviewed commit: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; compared with `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Evidence type: Git diff and source inspection. No browser, device, command output, screenshot or runtime test was recorded.
- Finding: The component source still renders ?Checking Status...? in its loading branch. No browser verification was performed for this review. The earlier incorrect status flash is not reproduced by source inspection alone. Empty/error branches need independent runtime verification.
- Result: Source review only; independent runtime QA Not Run.
- Required follow-up: Change loading copy to approved ?Processing?; exercise loading/error/state/empty priority, failed retrieval, successful retry and stale-error removal with simulated failures.
