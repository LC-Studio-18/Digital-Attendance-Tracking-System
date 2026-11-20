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

Create `backend/.env` using `backend/.env.example` as a template. The server
loads this file with `dotenv` when it starts.

Firebase Admin authentication requires these values:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

The Firebase private key can be entered on one line with `\n` between lines;
the application converts those escaped newlines before initializing Firebase.
The other service account fields (`FIREBASE_TYPE`, `PRIVATE_KEY_ID`, and the
certificate URLs) may remain in `.env`, but Firebase Admin only needs the three
values listed above for this configuration.

Attendance history also requires Google Sheets credentials and spreadsheet
configuration: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`
and `SHEET_RANGE`. Share the spreadsheet with the Google service account. The
integrated sheets service reads data using the configured `SHEET_RANGE` (for
example a tab/range such as `Attendance!A:Z`); ensure this is set correctly in
each environment. Private keys for both services can use `\n` escaped
newlines.

Keep real credentials in the ignored `backend/.env` file or a deployment
secret manager. Never commit credentials.

## Running the server

Development mode (restarts when files change):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

By default, the server listens on `http://localhost:5000`. Set `PORT` to use a
different port and `FRONTEND_URL` to the frontend origin allowed by CORS.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Checks whether the API is running |
| GET | `/api/v1/attendance/history` | Returns authenticated attendance history; supports `date`, `startDate`, `endDate`, `employeeId`, `page` and `limit` query parameters |

The full request/response contract for attendance history is documented in
[docs/attendance-history-api.md](docs/attendance-history-api.md). Staging
requirements and the current verification status are in
[docs/staging-checklist.md](docs/staging-checklist.md).

## Testing

Run the automated tests from `backend/`:

```bash
npm test
```

Tests use in-memory fixture data and do not read or modify the production
spreadsheet. Tests that require genuine Firebase ID tokens are skipped with an
explicit reason unless `TEST_STAFF_ID_TOKEN`, `TEST_ADMIN_ID_TOKEN` and
`TEST_EXPIRED_ID_TOKEN` are supplied to the test environment.

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
