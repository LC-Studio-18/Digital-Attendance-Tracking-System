# Frontend setup

## Firebase Authentication

Copy `.env.example` to `.env` and add the Firebase Web app configuration from
the Firebase project owner. Enable **Email/Password** in Firebase
Authentication. The login screen supports password sign-in, account creation,
password reset, and email-link sign-in. Google Sheets is used by the backend for
attendance data; it is not the login credential store.

For email-link sign-in, also enable the **Email link (passwordless sign-in)**
provider and add the app host to Firebase Authentication → Settings →
Authorized domains. Set `VITE_EMAIL_LINK_URL` to the page Firebase should return
to after the link is clicked.

Do not put Firebase Admin service-account credentials or private keys in the
frontend environment.

Admin controls read custom claims from the Firebase ID token. The frontend
recognizes `{ "role": "admin" }` or `{ "admin": true }`; the trusted backend
must assign those claims.

`src/services/authService.js` exposes the Firebase user-management helpers for
profile updates, email changes, email verification, password changes,
re-authentication, and account deletion. Sensitive operations require the user
to have signed in recently.

## Backend requests

Set `VITE_API_URL` to the backend API base URL. Requests through
`src/services/apiClient.js` include the current Firebase ID token as
`Authorization: Bearer <token>`. The backend must verify this token before
serving protected routes.

## Development

```bash
npm install
npm run dev
```
