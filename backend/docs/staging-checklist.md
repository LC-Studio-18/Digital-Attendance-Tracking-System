# Attendance History — Staging Preparation Checklist

This checklist covers attendance history work integrated on
`backend6-attendance-history` (including the latest remote architecture changes).
It is a preparation and verification record: **deployment, pull-request creation
and merging remain separate decisions**.

## 1. Code readiness

- [x] `GET /api/v1/attendance/history` is registered with `verifyToken` before
      the controller (`src/routes/attendance.js`, `src/app.js`).
- [x] Firebase ID tokens are verified by Firebase Admin in
      `src/middleware/authMiddleware.js`; role comes from the `role` custom
      claim and defaults to `staff`.
- [x] Admin access and staff access restrictions are enforced by controller
      role checks and role-scoped record retrieval.
- [x] Invalid tokens and missing/malformed Bearer headers receive 401.
- [x] Response shape, empty results, filtering and pagination are implemented by
      `src/controllers/attendanceController.js`,
      `src/utils/attendanceFilters.js` and `src/utils/attendanceResponse.js`
      (see `docs/attendance-history-api.md` for the integrated contract).
- [x] Attendance history automated tests exist (`tests/attendanceAuth.test.js`,
      `tests/attendanceAccessControl.test.js`, `tests/attendanceFiltering.test.js`,
      `tests/attendanceRoleAwareRetrieval.test.js`). Run `npm test` from
      `backend/` to verify current results in your environment.
- [x] Tests use stubbed/in-memory data for Firebase and Google Sheets access
      paths as implemented; live Firebase/Sheets integration is not verified by
      unit-style tests.
- [x] No secrets, `.env` values or service-account JSON are part of the changes.

## 2. Configuration required on staging

Provide these as environment variables or deployment secrets (see
`.env.example` for names):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `SPREADSHEET_ID`
- `SHEET_RANGE` (required by the integrated sheets service for attendance reads)
- `PORT` and `FRONTEND_URL` (CORS origin)

Access requirements:

- The Firebase service account must be able to verify ID tokens for the project.
- The Google service account must have read access to the attendance
  spreadsheet. The API only requests the `spreadsheets.readonly` scope.
- The spreadsheet must contain a header row; the UID column must be named
  `uid`, `user_id` or `user id (firebase uid)` so staff records can be matched.
- Real Firebase user accounts need a `role` custom claim of `admin` or `staff`.
  Without the claim, a user is treated as staff.

## 3. Verification before deploying

From `backend/`:

```bash
npm install
npm test
node --check src/app.js
```

Review the actual test summary produced in your environment (some tests may be
skipped when real Firebase test tokens are not supplied).

After deploying to staging, smoke-test:

1. `GET /api/health` returns a healthy response.
2. `GET /api/v1/attendance/history` without a token returns 401.
3. With a valid staff token, only that user's records are returned.
4. With a valid admin token, all records are returned.
5. With a valid token whose role is neither admin nor staff, 403 is returned.
6. With an admin token, `?date=YYYY-MM-DD`,
   `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`, `?employeeId=<id>` and combined
   filters return only matching records.
7. Invalid dates, invalid ranges and invalid `employeeId` values return 400.
8. A staff token supplying `employeeId` for another employee still receives
   only their own records.

## 4. Deployment status

**Not deployed.** No staging environment was configured for this task and
deployment was not explicitly authorised. This checklist records the locally
integrated state on `backend6-attendance-history` (including latest remote
changes) before any authorised push.

To deploy later, an authorised team member should:

1. Configure staging secrets from section 2 in the deployment platform.
2. Run the checks in section 3 on the target branch.
3. Deploy using the project's normal staging process.
4. Run the smoke tests in section 3 and report results.

## 5. Known local limitations

- The local `backend/.env` has a `FIREBASE_PRIVATE_KEY` that cannot be parsed as
  a PEM private key (`app/invalid-credential`). Genuine Firebase Admin
  initialisation therefore fails locally. The invalid-token tests use the real
  Firebase Admin SDK verifier with a project-ID-only app, which is sufficient
  to prove rejection but not acceptance of a genuine token.
- No valid staff/admin ID token or expired ID token is available locally. The
  corresponding three real-token tests skip with an explicit reason. Supply
  `TEST_STAFF_ID_TOKEN`, `TEST_ADMIN_ID_TOKEN` and `TEST_EXPIRED_ID_TOKEN` to
  the test environment to enable them; never store those values in test files.
- A genuine Admin token previously returned zero records instead of the two
  expected fixture records. The API reads the `role` custom claim and defaults
  to `staff` when it is absent, so a token without `role: 'admin'` is filtered
  by its UID and can legitimately match no rows. Verify the decoded claims and
  reissue the token after setting the claim (custom claims can take time to
  propagate). This could not be re-verified here because no real test ID tokens
  are available. Mocked Admin tests only prove controller filtering.
- A locally parseable service-account key and a safe staging Firebase project
  are needed before real end-to-end authenticated requests can be verified.

## 6. Review / PR handover

- Integrated branch: `backend6-attendance-history` (local, synchronized with
  `origin/backend6-attendance-history` after fast-forward integration; not
  pushed by this process).
- Key integrated implementation files: `src/routes/attendance.js`,
  `src/controllers/attendanceController.js`, `src/services/sheets.js`,
  `src/utils/attendanceFilters.js`, `src/utils/attendanceResponse.js`.
- Reviewers should check attendance tests and the API contract in
  `docs/attendance-history-api.md`.
- Frontend/shared endpoint alignment should be confirmed with the team if any
  consumer still expects a different path.
- Pull-request creation, review approval, merging and deployment require
  explicit authorisation.
