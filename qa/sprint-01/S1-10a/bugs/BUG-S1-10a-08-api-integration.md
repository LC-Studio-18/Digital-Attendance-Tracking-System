# S1-10a / BUG-S1-10a-08 - Clock-out API request is not implemented

## Bug Information
- Ticket ID: S1-10a
- Linked subtask: ST-04
- Linked test case: TC-01
- Date reported: 20 November 2026
- Reported by: Adam Jattiem
- Assigned developer: Elijah
- Severity: High (proposed QA classification)
- Status: Open - real backend API integration is mandatory and missing by prior source review; live execution not tested by Zaarah.

## Environment
- Branch: `frontend4-feature/s1-10a-clock-out` (source/runtime review; QA4 documentation branch)
- Commits reviewed: `f998ab224f8a83152be733ffbb791079a50869d3`, `3c1238284b765e7b85f1a55d0fb8f85374cb0aa3`
- Browser/device: Not recorded
- Operating system: Windows

## Preconditions
- Clock-out page running on f998ab2.

## Steps to Reproduce
1. Open browser network tools and click Clock Out.
2. Inspect Fetch/XHR requests; review source for an API client call.

## Expected Result
- Frontend sends a clock-out request to the backend and handles the response, as stated in the ticket acceptance criteria.

## Actual Result
- No Fetch/XHR clock-out request was observed. Source review confirms no API request implementation. Local mock state changes only.

## Evidence
- Manual network observation and source review reported for 19 Nov; no saved log/screenshot. Mock-data allowance was verbally confirmed by Scrum Masters, but it does not independently waive the explicit API criterion. Actual integration verification is blocked/deferred pending scope confirmation and endpoint availability.

## Fix and Retest History
- Required criterion: preserve the ticket's explicit API requirement unless Scrum Masters formally clarify its scope.
- Proposed approach: coordinate and implement the required real API integration.
- QA retest: observe request/response and resulting state with available backend once scope and dependency are resolved.
- Retest status: Blocked.

## Resolution
Open; real API integration is mandatory. Earlier uncertainty about mock-data acceptance is superseded.


### 20 November 2026 - Zaarah Okkers reported retest
- Tested commit `ee8ff3e88a519727015d79ead5446e993ac48ddb`; Open - real backend API integration is mandatory and missing by prior source review; live execution not tested by Zaarah.
- Her session used dummy data; real authentication and API were not tested. Screenshots/logs pending. Earlier mock-data approval understanding is superseded: real integration is required for S1-10a.
