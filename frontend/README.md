# Frontend setup

## Firebase Authentication

Install frontend dependencies, then copy `.env.example` to `.env` and add the
Firebase web app configuration. The values are provided by the Firebase
project owner:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Do not put a Firebase Admin service-account JSON or private key in the frontend
environment. The React app uses the web app config above.

Enable **Email/Password** as a sign-in provider in Firebase Authentication.
The login page supports email and password sign-in, sign-out, persistence via
“Remember Me”, and password reset emails.

Admin controls use custom claims on the Firebase ID token. The trusted backend
must assign either `{ "role": "admin" }` or `{ "admin": true }`; the frontend
only reads these claims and cannot grant Admin access. All other users see the
standard dashboard controls only.

## Backend requests

Set `VITE_API_URL` to the backend API base URL. Requests made with
`src/services/apiClient.js` automatically include the current Firebase ID token
as `Authorization: Bearer <token>`. The backend must verify this token before
serving protected routes; the current backend only has a public health route.

## Development

```bash
npm install
npm run dev
```
