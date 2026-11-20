# ST-03 - Display Current Status

## Information
- Ticket ID: S1-15
- Assigned developer: Not confirmed.
- Current QA status: Preliminary developer result recorded; independent QA Not Run.

## Objective
- Display the employee current attendance state accurately.

## Acceptance Criteria
- [ ] Correct IN and OUT status are displayed.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Check the displayed state for clocked-in and clocked-out conditions. | Correct IN and OUT status are displayed. | Fail reported; independent QA Not Run. |

## Linked Bugs
- [BUG-S1-15-03](bugs/bug-s1-15-03-reported.md)

## Testing History

### Preliminary developer testing - date and build not recorded
- Tester and finding source: Zaarah (Fullstack Developer). These are Zaarah?s reported observations, not independent QA results.
- Test case ID: TC-01
- Branch: Not recorded.
- Commit SHA: Not recorded.
- Environment/browser/device: Not recorded.
- Preconditions/reproduction steps: Not recorded; no steps were supplied.
- Expected result: Correct IN and OUT status are displayed.
- Reported actual result: Loading temporarily displayed Clocked Out or ?You haven?t clocked in yet? before Clocked In, as reported by Zaarah.
- Reported result: Fail reported; independent QA Not Run.
- Independent QA result: Not Run.
- Evidence: Not provided; no screenshots or logs supplied.
- Retest: Adam to reproduce independently after relevant changes; record tested build and evidence then.


### 20 November 2026 - QA source review (not runtime test)
- Reviewer: Adam Jattiem. Source branch: `frontend4-feature/s1-15-attendance-status`. Reviewed commit: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; compared with `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Evidence type: Git diff and source inspection. No browser, device, command output, screenshot or runtime test was recorded.
- Finding: The latest source changed IN/OUT card wording. Source shows ?Your arrival has been recorded. Live tracking has been enabled? for IN and ?Thank you for your time? for OUT. This is a source observation, not a behavioral pass. Zaarah?s requested ?You are currently Clocked In? and ?You haven?t clocked in yet? wording is not present in this revision.
- Result: Source review only; independent runtime QA Not Run.
- Required follow-up: Confirm approved wording and daily/overnight rules; render not-yet-clocked-in, currently IN, successfully OUT and no-record states. Verify previous-day records and timestamps.
