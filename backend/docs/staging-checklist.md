# Attendance History — Staging Preparation Checklist

This checklist covers attendance history work prepared on
`xabiso-backend-work` and pushed to `backend6-attendance-history`. It is a
preparation and verification record: **deployment, pull-request creation and
merging remain separate decisions**.

## 1. Code readiness

- [x] `GET /api/v1/attendance/history` is registered with `verifyToken` before
      the controller (`src/routes/attendanceRoutes.js`, `src/app.js`).
- [x] Firebase ID tokens are verified by Firebase Admin in
      `src/middleware/authMiddleware.js`; role comes from the `role` custom
      claim and defaults to `staff`.
- [x] Admin sees all records; staff sees only records matching the verified UID;
      other verified roles receive 403.
- [x] Invalid tokens and missing/malformed Bearer headers receive 401.
- [x] Response shape, empty results, filtering and pagination match the
      documented contract (`docs/attendance-history-api.md`).
- [x] Automated tests added (`tests/attendanceAuth.test.js`,
      `tests/attendanceAccessControl.test.js`, `tests/attendanceFiltering.test.js`)
      and the existing response tests still pass.
- [x] No production attendance data is touched by tests: Google Sheets is
      replaced with in-memory fixtures.
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
- `SHEET_RANGE` (optional; defaults to columns A:Z of the first tab)
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

Expected result: 46 tests discovered; 43 pass, 0 fail, 3 skipped. The three
skipped tests require real test ID tokens (see section 5).

After deploying to staging, smoke-test:

1. `GET /api/health` returns a healthy response.
2. `GET /api/v1/attendance/history` without a token returns 401.
3. With a valid staff token, only that user's records are returned.
4. With a valid admin token, all records are returned.
5. With a valid token whose role is neither admin nor staff, 403 is returned.
6. With an admin token, `?date=YYYY-MM-DD`,
   `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`, `?employeeId=<uid>` and combined
   filters return only matching records.
7. Invalid dates, invalid ranges and invalid `employeeId` values return 400.
8. A staff token supplying `employeeId` for another employee still receives
   only their own records.

## 4. Deployment status

**Not deployed.** No staging environment was configured for this task and
deployment was not explicitly authorised. This checklist records the state
before the authorised push to `backend6-attendance-history`.

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

- Preparation branch: `xabiso-backend-work`; push target:
  `backend6-attendance-history`. `src/utils/attendanceResponse.js` is unchanged
  from committed HEAD and still uses string comparison for sorting.
- Reviewers should check `tests/attendanceAuth.test.js` (real verifier),
  `tests/attendanceAccessControl.test.js` (stubbed verifier) and the API
  contract in `docs/attendance-history-api.md`.
- Pull-request creation, review approval, merging and deployment require
  explicit authorisation.
