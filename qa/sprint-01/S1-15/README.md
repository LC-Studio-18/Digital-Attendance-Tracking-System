# S1-15 - Attendance Status Display

## Ticket Information
- Sprint: 1
- Team: 4
- Frontend branch: frontend4-feature/s1-15-attendance-status
- Backend branch: backend4-feature/s1-15-attendance-status
- QA status: Preliminary developer testing reported; independent QA not run

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

These are based on Zaarah's report and await independent QA reproduction and triage.

## Preliminary Developer Testing - Zaarah
All findings below were reported by Zaarah (Fullstack Developer). They are preliminary developer test results, not independent QA verification. Test dates, commit SHAs, browser/device, screenshots and exact reproduction steps were not recorded.

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

### Persistence and implementation
- The implementation has not yet been established from this documentation review. Whether status persistence uses dummy data, local storage or the real backend is **Not verified**. A reported pass after refresh does not prove backend persistence.
- Independently inspect the relevant frontend/backend implementation and verify the persisted source during QA retest. Preserve the distinction between mock/local persistence and backend persistence.

### Reported developer retests required
- Recheck card dimensions, colours, text and decorative elements against the relevant design references.
- Check the conditional clocked-out message with both daily attendance conditions.
- Exercise loading while transitioning to Clocked In; use test controls in the next round.
- Refresh while clocked in and identify whether the result comes from mock data, local storage or backend.
- Independently verify API integration, status updates, loading/empty/error handling and all remaining original acceptance criteria.

## Testing Summary
- Developer-reported results: 2 reported passes (card colours; status unchanged after refresh), 3 reported failures (clocked-out design/wording; clocked-in design/formatting; loading wording/temporary status), 1 conditional behavior requiring verification, 1 testing-control request, and 1 pending feature request. These are not independent QA totals. Linked reported defects are BUG-S1-15-01 through BUG-S1-15-04.
- Independent QA results: Not Run. Do not count the reported results as QA passes/failures.
- Current readiness: Not ready for QA sign-off; independent verification, implementation/persistence review, API/integration checks and remaining acceptance criteria are outstanding.

## QA Sign-off
- Status: Pending
- QA: Adam Jattiem
- Independent QA date: Not recorded
- Notes: Zaarah's preliminary developer findings are documented; independent QA has not verified them.
