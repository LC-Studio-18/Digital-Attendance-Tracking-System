# Attendance History — Staging Checklist

This checklist records the current integrated implementation. Local automated
results are separated from live-service and deployment checks.

## Implemented and verified by source review

- [x] `GET /api/v1/attendance/history` is mounted in `src/app.js` and protected
      by `verifyToken` in `src/routes/attendance.js`.
- [x] Firebase ID tokens supply `uid`, `email`, and `role`; absent role claims
      default to `staff`. Only `admin` and `staff` roles are accepted.
- [x] Admins can query all retrieved rows. Staff rows are scoped to the
      authenticated UID using the supported Firebase UID columns.
- [x] `date`, `startDate`, `endDate`, `employeeId`, `page`, and `limit` are
      implemented with validation, filtering, sorting, and pagination. See
      `attendance-history-api.md` for the contract.
- [x] Google Sheets reads use `src/services/sheets.js` and the configured
      `SHEET_RANGE`; sheet rows are mapped by the controller.
- [x] Likona confirmed the frontend API arrangement uses
      `GET /api/v1/attendance/history`.

## Automated tests run locally

- [x] `npm test` from `backend/`: **44 passed, 0 failed, 3 skipped** in the
      verification run for this documentation update.
- [x] Automated tests cover route authentication, access control, filtering,
      sorting, pagination, empty results, and role-aware retrieval using test
      doubles or in-memory fixtures.
- [ ] Three tests requiring genuine Firebase ID tokens were skipped because
      `TEST_STAFF_ID_TOKEN`, `TEST_ADMIN_ID_TOKEN`, and
      `TEST_EXPIRED_ID_TOKEN` were not supplied. The suite did not verify real
      staff/admin token acceptance or an expired real token.
- [ ] The controller's mapping of actual two-dimensional Google Sheets rows is
      implemented in source, but the current tests do not establish live sheet
      header/content behavior against Google Sheets.

## Staging configuration still required

Provide these values through the staging secret/environment configuration:

- [ ] Firebase: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
      `FIREBASE_PRIVATE_KEY`.
- [ ] Google Sheets: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
      `SPREADSHEET_ID`, and a valid `SHEET_RANGE` (the service has no range
      default; the current `.env.example` optional/default comment is stale).
- [ ] Server/CORS: `PORT` as needed and `FRONTEND_URL` set to the deployed
      frontend origin.
- [ ] Grant the Google service account read access to the target spreadsheet
      and verify the configured range includes the header row and attendance
      data. The service requests only the `spreadsheets.readonly` scope.
- [ ] Ensure Firebase users have `admin` or `staff` role claims as appropriate;
      users without a role claim are treated as staff.

## Live checks still required

- [ ] Verify staging Firebase token acceptance with real staff and admin ID
      tokens, including a token with no role claim and an expired token.
- [ ] Verify Google authentication, spreadsheet access, range selection,
      header mapping, and records against the staging spreadsheet.
- [ ] Smoke-test health, missing/invalid token responses, role restrictions,
      filters, pagination, and upstream Google Sheets error handling in staging.
- [ ] Confirm records in staging match expected staff UID scoping and admin
      visibility; confirm filter results against real sheet data.

## Deployment and production status

- [ ] Staging deployment has not been performed or verified by this work.
- [ ] Production deployment and production verification have not been
      performed or claimed here.
- [ ] Deployment, merge, and release actions remain with the project owners.
