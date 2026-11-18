# Team 4 - Quality Assurance

## Project
Digital Attendance Tracking System

## Team Information
- Team: 4
- QA tester: Adam Jattiem
- QA branch: QA4
- Scrum Master: Not recorded

## Responsibilities
- Test assigned tickets and subtasks.
- Verify acceptance criteria and Definition of Done.
- Record test results and defects.
- Perform retesting and regression testing.
- Maintain QA Markdown records on QA4; Google Sheets is optional.

## Documentation Structure
- templates/ - Reusable QA templates.
- sprint-01/ - Sprint 1 testing documentation.
- sprint-02/ - Sprint 2 testing documentation.

## Testing Workflow
1. Review the assigned Slack ticket.
2. Identify the exact version to test.
3. Test the exact developer commit in a separate detached Git worktree, keeping QA4 separate.
4. Record results in Markdown on QA4. Google Sheets is optional.
5. Report defects to the responsible developer.
6. Retest fixes and perform regression testing.
7. Commit QA documentation to QA4.

## Rules
- Do not merge developer code into QA4 merely to test.
- Preserve all previous testing records.
- Record the exact tested commit or Figma version.
- Do not commit credentials or real employee data.

## Resources
- [Slack Ticket Tracker](https://lifechoicesnpo.slack.com/lists/T02LW4RMXJQ/F0CG5PD0XB6)
- [Team 4 QA Tracker (optional)](https://docs.google.com/spreadsheets/d/1cdwvG8Ibe50WAbJ5nBo2iStTzkpgYkZibzR_VscYI3M/edit)
- [Sprint 1](sprint-01/README.md)

## Test Statuses
- Pass: Expected result achieved.
- Fail: An evaluated result did not meet expectations.
- Blocked: A dependency prevents completion.
- Not Run: The check has not been executed.

## Templates
- [Ticket template](templates/ticket-template.md)
- [Subtask template](templates/subtask-template.md)
- [Bug template](templates/bug-template.md)
