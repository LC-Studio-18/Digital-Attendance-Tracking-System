# Attendance history page (Phase 2)

Route: `/attendance-history` (the existing S1-16 feedback preview stays at `/`).

## Files

| File                                       | Purpose                                                  |
| ------------------------------------------ | -------------------------------------------------------- |
| `src/pages/AttendanceHistoryPage.jsx`      | Page, role-based columns, loading / empty / error states |
| `src/pages/AttendanceHistoryPage.test.jsx` | Page tests                                               |
| `src/services/attendanceApi.js`            | Axios call to `GET /api/v1/attendance/history`           |
| `src/services/authService.js`              | Firebase ID token + custom-claim role lookup             |
| `src/firebase/firebase.js`                 | Firebase app and Auth initialisation                     |
| `src/utils/authToken.js`                   | Token fallback + role claim helpers                      |
| `src/utils/attendanceFilters.js`           | Filter helpers, API params and client-side fallback      |
| `src/components/HistoryFilters.jsx`        | Filter form (date range, status, search, clear)          |
| `src/styles/attendance-history.css`        | Page + filter styles using the shared design tokens      |

## Integration notes

- Base URL comes from `VITE_API_URL` (falls back to `http://localhost:5000`).
- Firebase web config lives in `.env` as `VITE_FIREBASE_*` values (see
  `.env.example`). Web config is public by design; restrict authorised domains
  in the Firebase console. Never put server secrets in `VITE_*` variables.
- `getAuthSession()` prefers `auth.currentUser.getIdToken()` and
  `getIdTokenResult().claims.role`. If nobody is signed in, it falls back to a
  stored token (`firebaseIdToken`, with `idToken` / `authToken` / `token` as
  fallbacks).
- Roles accepted: `role: 'admin'`, `userRole: 'admin'`, `roles: ['admin']` or
  `admin: true`. Missing or unknown values default to `staff`, so admin columns
  are hidden. Claim decoding is for UI only — the backend must verify the token
  and enforce roles.
- The token is sent as `Authorization: Bearer <token>` on the history request.
- Admin-only columns: **Staff**, **Email**, **Department**. Staff see Date,
  Clock in, Clock out, Hours and Status. Column definitions live at the top of
  `AttendanceHistoryPage.jsx` and can be adjusted when the final Figma spec is
  available.
- The page accepts `history`, `records`, `results`, `attendance` or a bare array
  from the API response.
- Loading uses the shared `Loader`; failures use the shared `ErrorMessage` with
  a Retry action; an empty array renders the empty state.

## Filters

- The filter form sends its values as query parameters on the history request:
  `startDate`, `endDate`, `status` (`IN` / `OUT`) and `search` (staff name,
  email or department). Empty values are omitted.
- Filters are applied with **Apply filters** (or Enter). **Clear filters**
  resets the form and refetches without parameters. Refresh keeps the active
  filters.
- The table renders the records returned by the API. The same filters are also
  applied client-side as a fallback if the API ignores the parameters, so the
  displayed rows always match the active filters.
- An invalid date range shows an inline error and does not send a request. If
  nothing matches, the empty state offers **Clear filters** as well as Refresh.

## Still to confirm

- Login flow: which Firebase method is used (email/password, etc.) and whether
  it stores an ID token anywhere.
- Exact custom-claim name for `admin` on the backend.
- Final Figma column set and confirmation of the query parameter names above
  with the backend owner.
