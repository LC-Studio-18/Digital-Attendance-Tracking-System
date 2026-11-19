# Digital Attendance Tracking System – Backend

## Overview

The backend provides the API server for the Digital Attendance Tracking System, built using Node.js and Express.

## Prerequisites

- Node.js (LTS)
- npm

## Installation

From the project root:

```bash
cd backend
npm install
```

## Environment Configuration

Create a `.env` file in the backend directory using `.env.example` as a reference.

Required variables:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
VALID_LOCATION_IDS=your-location-id-here
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-google-service-account-email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your-spreadsheet-id
```

Firebase credentials verify attendance tokens. Google Sheets credentials read and write attendance rows; share the target spreadsheet with that service account. Store real credentials only in the ignored `backend/.env` file.

## Running the Server

Development mode (automatically restarts when files change):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server runs at:

`http://localhost:5000`

## Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Checks whether the API is running |
| POST | `/api/attendance/qr-checkin` | Records an authenticated attendance check-in |

### QR check-in contract (shared with the frontend)

Send a Firebase ID token and exactly this JSON object:

```http
POST /api/attendance/qr-checkin
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{"locationId":"LC-STUDIO-MAIN"}
```

`locationId` is required, must be a hyphen-separated alphanumeric string, and must exactly match `VALID_LOCATION_IDS`. Extra properties are rejected.

| Status | Meaning |
|---|---|
| 200 | Check-in recorded |
| 400 | Malformed JSON or invalid QR payload/location |
| 401 | Missing or invalid Firebase token |
| 409 | User already checked in today |
| 502 | Google Sheets request failed |
| 503 | Firebase or Google Sheets is not configured |

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   │   └── healthController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── healthRoutes.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── package-lock.json
```

## Technologies

- Node.js
- Express
- CORS
- dotenv
- Nodemon

**Note:** Never commit `.env` files or private credentials to the repository.
