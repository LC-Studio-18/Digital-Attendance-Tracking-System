# Digital Attendance Tracking System — Backend

## Overview

The backend is a Node.js and Express API. It verifies Firebase ID tokens and
reads attendance records from Google Sheets.

## Prerequisites

- Node.js (LTS)
- npm

## Installation

From the project root:

```bash
cd backend
npm install
```

## Environment configuration

Create `backend/.env` from `backend/.env.example`. The server loads it through
`dotenv` in `src/server.js` before loading the application.

Firebase Admin requires `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
`FIREBASE_PRIVATE_KEY`. A single-line private key may use literal `\n`
sequences between PEM lines; `src/config/firebase.js` converts them to actual
newlines. Keep values in dotenv `NAME=value` form rather than copying JSON
property syntax.

Google Sheets access requires `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
`SPREADSHEET_ID`, and `SHEET_RANGE`. The sheet service requests the
`spreadsheets.readonly` scope and uses `SHEET_RANGE` as supplied; configure a
valid A1 range such as `Attendance!A:Z`. An empty range is not given a default
by the current service. Google private keys also use literal `\n` sequences.

Set `PORT` to choose the listening port (`5000` by default) and `FRONTEND_URL`
to the allowed frontend origin for CORS. Keep real credentials in the ignored
`backend/.env` file or a deployment secret manager. Never commit credentials.

## Running the server

Development mode (restarts when files change):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

By default, the server listens on `http://localhost:5000`.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Checks whether the API is running |
| GET | `/api/v1/attendance/history` | Authenticated attendance history; supports `date`, `startDate`, `endDate`, `employeeId`, `page` and `limit` |

Attendance history requires `Authorization: Bearer <Firebase ID token>`.
Firebase roles are taken from the verified token; users without a role claim
default to `staff`. Admins can query across employees. Staff are restricted to
records matching their authenticated Firebase UID. See
[docs/attendance-history-api.md](docs/attendance-history-api.md) for filters,
validation, response fields and errors.

## Testing

Run the automated tests from `backend/`:

```bash
npm test
```

Most API behavior tests use in-memory fixtures; authentication tests also exercise
Firebase verification with invalid tokens. Tests requiring genuine
Firebase ID tokens are skipped with an explicit reason unless the corresponding
`TEST_STAFF_ID_TOKEN`, `TEST_ADMIN_ID_TOKEN` and `TEST_EXPIRED_ID_TOKEN`
environment variables are supplied.

## Project structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── docs/
│   ├── attendance-history-api.md
│   └── staging-checklist.md
├── tests/
├── .env.example
├── package.json
└── package-lock.json
```

## Technologies

- Node.js and Express
- Firebase Admin SDK
- Google Sheets API (`googleapis`)
- CORS, dotenv, and Nodemon
