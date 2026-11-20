# S1-15 - Attendance Status Display

## Ticket Information
- Sprint: 1
- Team: 4
- Frontend branch: frontend4-feature/s1-15-attendance-status
- Backend branch: backend4-feature/s1-15-attendance-status
- QA status: Preliminary developer testing reported; independent QA not run

## Assessment Record
- Assessment date: 20 November 2026 (SAST), as supplied.
- QA4 at review: `56adb929900e91850e90dcb4ab176cda6b120f4e` (confirmed remote).
- Frontend source reviewed: `5d68b59d1503448b4f8d370d7e22d92cd9edf51b`; previous commit: `77e89b660d02f39f5899b559fa511840de1f99d5`.
- Developer: Elijah. Previous developer tester: Zaarah. Responsible QA: Adam Jattiem.
- The newer SHA is the source snapshot reviewed; it is not represented as tested at runtime.

## Requirements
- Display current staff attendance status.
- Integrate the attendance status API.
- Display IN and OUT indicators.
- Update status after attendance actions.
- Persist the latest attendance status.
- Handle loading, empty and error states.

## Acceptance Criteria
- [ ] Correct IN status is displayed.
- [ ] Correct OUT status is displayed.
- [ ] Status updates after clock-in.
- [ ] Status updates after clock-out.
- [ ] Status remains correct after page refresh.
- [ ] Visual indicators match attendance status.
- [ ] Loading, empty and error states work.
- [ ] Frontend and backend integration works.

## Dependencies
- Team 2 clock-in functionality.
- S1-10a clock-out frontend.
- S1-10b clock-out backend.
- Shared attendance status API.

## Subtasks
Official subtask IDs and assignments are not recorded in the ticket evidence. Existing report filenames are retained as documentation references, not asserted official IDs.

## Linked Bugs
- [BUG-S1-15-01](bugs/bug-s1-15-01-reported.md) - Loading label differs from reported expected wording.
- [BUG-S1-15-02](bugs/bug-s1-15-02-reported.md) - Incorrect attendance message appears during loading.
- [BUG-S1-15-03](bugs/bug-s1-15-03-reported.md) - Clocked-out card dimensions and wording differ.
- [BUG-S1-15-04](bugs/bug-s1-15-04-reported.md) - Clocked-in card formatting differs from design.

These are based on Zaarah's report and await independent QA reproduction and triage. No existing reported defect was closed by source review. The latest source review is separately attributed to Adam on the cited SHA.

## Preliminary Developer Testing - Zaarah
All findings below were reported by Zaarah (Fullstack Developer). They are preliminary developer test results, not independent QA verification. Test dates, commit SHAs, browser/device, screenshots and exact reproduction steps were not recorded for Zaarah?s testing.

| Reported check | Expected result | Zaarah's reported result | Preliminary status | Follow-up |
|---|---|---|---|---|
| Clocked-out card design and wording | Card matches Figma and uses ?You haven?t clocked in yet? | Dimensions differ; current wording is ?You are not clocked in? | Fail reported | Correct size and wording, then independent visual and text retest. |
| Clocked-out card colours | Colours match the design | Colours passed Zaarah's testing | Pass reported | Independent QA visual verification pending. |
| Clocked-out conditional message | ?Your attendance hasn?t been recorded for today? appears only when the employee has not clocked in that day | Correct condition was requested; observed behavior was not described | Further verification required | Check clocked-out and not-yet-clocked-in states independently. Not counted as pass/fail. |
| Clocked-in card | Card matches Figma; time colour follows Slack specification; wording is ?You are currently Clocked In?; time uses 24-hour format with regular weight; Figma sparkles/stars appear | These design and formatting changes were requested | Fail reported | Apply changes and independently compare with Figma and the Slack colour reference. |
| Loading state | Display ?Processing?; keep attendance state accurate while loading | ?Checking Status? appears; card temporarily shows Clocked Out or ?You haven?t clocked in yet? before Clocked In | Fail reported | Correct label and loading-state content; retest transitions and displayed state. |
| Testing controls | Controls permit clock-in/out testing in next round | Requested; not reported as a production behavior defect | Testing requirement | Add/use suitable test controls for the next test round; do not classify as a production bug. |
| Confirmation pop-up | Requirement and behavior to be defined | Confirmation before clocking in/out requested | Pending feature request | Clarify trigger, wording, design and acceptance with product/Scrum Masters before adding to acceptance criteria. Not a failed test. |
| Status after refresh while clocked in | Status remains correct after refresh | Zaarah reported status remained unchanged | Pass reported | Independent QA verification and persistence mechanism check pending. |

### Latest source review - 20 November 2026
Compared frontend commit `5d68b59d1503448b4f8d370d7e22d92cd9edf51b` with `77e89b660d02f39f5899b559fa511840de1f99d5` using Git diff/source inspection only. Runtime tests were not run for this review.

Changes observed in source:
- Clock In and Clock Out test buttons are present in `App.jsx`.
- OUT state returns and displays a mock clock-out timestamp.
- Attendance status cards and CSS changed; checkmark assets were added.
- Colours, spacing, typography and wording changed.

These are implementation observations, not QA passes. The source still shows potential gaps for the listed design requirements (clocked-in wording, ?Processing?, 24-hour format and regular time weight). Verify exact designs/colour references before deciding conformity. Loading branch still uses ?Checking Status...?. Review of the shown source also indicates the attendance service formats timestamps using its existing formatter; verify 24-hour output at runtime before acceptance. No confirmation pop-up acceptance criterion is recorded.

### Previous ChatGPT-assisted isolated assessment (reported, evidence not provided)
A prior assessment reported these isolated mock-service results: latest dummy record retrieval Pass; clock-out and timestamp retrieval Pass; simulated reload persistence after clock-out Pass; clock-in after clock-out Pass; simulated reload persistence after clock-in Pass; empty records returns null Pass; 24-hour formatting Fail; daily attendance handling Fail; authenticated employee identification Fail in mock configuration; persistence under simulated storage loss Fail. Five isolated component checks for IN, OUT, loading, empty and error states were also reported. Commands, outputs, environment, steps, screenshots/logs and exact tested SHA were Not recorded. These results are not independently reproduced and are excluded from verified QA totals. The simulated storage-loss failure is a mock diagnostic limitation, not by itself a production defect. Daily attendance behavior needs an agreed rule, including overnight shifts, before classification.

### Persistence and implementation
- Source inspection of the cited frontend commit shows mock data persisted through browser `localStorage`; this is not production backend persistence. Zaarah's reported refresh pass does not prove backend persistence. A reported pass after refresh does not prove backend persistence.
- Independently inspect the relevant frontend/backend implementation and verify the persisted source during QA retest. Preserve the distinction between mock/local persistence and backend persistence.

### Reported developer retests required
- Recheck card dimensions, colours, text and decorative elements against the relevant design references.
- Check the conditional clocked-out message with both daily attendance conditions.
- Exercise loading while transitioning to Clocked In; use test controls in the next round.
- Refresh while clocked in and identify whether the result comes from mock data, local storage or backend.
- Independently verify API integration, status updates, loading/empty/error handling and all remaining original acceptance criteria.

## Testing Summary
- Zaarah-reported results: 2 reported passes (card colours; refresh status), 3 reported failures (clocked-out design/wording; clocked-in design/formatting; loading wording/temporary status), 1 conditional behavior requiring verification, 1 testing-control request, and 1 proposed confirmation feature. These are not independent QA totals.
- Previous ChatGPT-assisted isolated results are reported separately above; not independently reproduced and excluded from verified totals.
- Source review of 5d68b59 confirms changes only; no new runtime pass/fail is assigned from code inspection. Independent QA results: Not Run.
- Independent QA results: Not Run. Do not count the reported results as QA passes/failures.
- Current readiness: Changes required; not ready for Done. Independent verification, persistence implementation review, API/integration, responsive checks, code review, end-to-end QA and Product Owner acceptance remain outstanding.

### Remediation guidance prepared for Elijah (not confirmed as sent)
- Scope CSS to the attendance component; align card dimensions, padding, spacing, typography, alignment, radius, approved colours and decorative assets with references.
- Apply approved state wording and conditional daily messages; confirm overnight rules before date-based logic changes.
- Use a private 24-hour `HH:mm` formatter and regular time weight after confirming expected timezone/colour.
- Show immediate Processing feedback, guard against duplicate actions, preserve state on errors and refresh status after successful actions.
- Validate and isolate mock localStorage data (suggested key `s1-15:dummyAttendanceEvents`); handle malformed/unavailable storage without clearing unrelated data.
- Provide accessible loading/error feedback and isolate temporary testing controls from production features.

### Cross-team and integration risks
- GitHub comparison indicates S1-15 and S1-10a both change `frontend/src/App.jsx`, `App.css` and `index.css`. This is a potential merge/integration conflict, not a confirmed runtime defect. Avoid unrelated components, shared API contracts, backend logic, Firebase authentication and global styling changes.
- Real status API, authenticated employee identity, backend persistence, Team 2 clock-in, S1-10a clock-out, shared-branch integration, code review, end-to-end QA and Product Owner acceptance remain unverified. Mock tests do not satisfy these integration requirements.
- The confirmation pop-up remains a proposed feature pending approval; it is not an acceptance criterion.

## QA Sign-off
- Status: Pending
- QA: Adam Jattiem
- Independent QA date: Not recorded
- Notes: Zaarah's preliminary developer findings and Adam's source review are documented; independent runtime QA has not been performed. Final QA sign-off remains Pending.
