# ST-07 - Visual Indicators

## Information
- Ticket ID: S1-15
- Assigned developer: Not confirmed.
- Current QA status: Preliminary developer result recorded; independent QA Not Run.

## Objective
- Display attendance wording, time and visual indicators accurately.

## Acceptance Criteria
- [ ] Status text, time colour/format/weight and decorative indicators match approved references.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Review clocked-in and clocked-out text, time and visual indicators. | Status text, time colour/format/weight and decorative indicators match approved references. | Fail reported for discrepancies; colour check separately reported Pass. Independent QA Not Run. |

## Linked Bugs
- [BUG-S1-15-04](bugs/bug-s1-15-04-reported.md)

## Testing History

### Preliminary developer testing - date and build not recorded
- Tester and finding source: Zaarah (Fullstack Developer). These are Zaarah?s reported observations, not independent QA results.
- Test case ID: TC-01
- Branch: Not recorded.
- Commit SHA: Not recorded.
- Environment/browser/device: Not recorded.
- Preconditions/reproduction steps: Not recorded; no steps were supplied.
- Expected result: Status text, time colour/format/weight and decorative indicators match approved references.
- Reported actual result: Clocked-out wording, clocked-in capitalization, time colour, 24-hour format, regular weight and surrounding sparkles/stars were reported as needing correction. Clocked-out card colours passed Zaarah?s testing.
- Reported result: Fail reported for discrepancies; colour check separately reported Pass. Independent QA Not Run.
- Independent QA result: Not Run.
- Evidence: Not provided; no screenshots or logs supplied.
- Retest: Adam to reproduce independently after relevant changes; record tested build and evidence then.


### 20 November 2026 - QA source review (not runtime test)
- Reviewer: Adam Jattiem. Source branch: `frontend4-feature/s1-15-attendance-status`. Reviewed commit: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; compared with `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Evidence type: Git diff and source inspection. No browser, device, command output, screenshot or runtime test was recorded.
- Finding: Latest source adds checkmark assets and changes text and time CSS. Source sets time font weight to 700, not the requested 400. A 24-hour formatter and exact Slack colour were not confirmed by this diff. Runtime rendering remains Not Run.
- Result: Source review only; independent runtime QA Not Run.
- Required follow-up: Use verified private HH:mm formatter, regular weight 400, exact approved Slack colour, approved decorations; distinguish IN/OUT accessibly and retest readability.
