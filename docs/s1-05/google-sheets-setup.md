# Google Sheets API Integration

## 1. Overview

The backend reads attendance data from a Google Spreadsheet using the Google Sheets API v4. It authenticates with a **service account**, which is a Google "robot" account with its own email address and private key. The spreadsheet is shared with that email, so no user login is needed.

- Access is **read-only** (`spreadsheets.readonly` scope).
- Credentials live only in the backend `.env` file. They are never sent to the frontend and never committed to Git.
- The frontend never talks to Google. It calls the backend endpoint, and the backend talks to Google.

```
Frontend  -->  GET /api/attendance  -->  Backend  -->  Google Sheets API  -->  Attendance spreadsheet
```

## 2. Code locations

| File | Purpose |
|---|---|
| `backend/src/services/sheets.js` | Authenticates with Google and reads the spreadsheet. Maps Google errors to clean errors. |
| `backend/src/routes/attendance.js` | Defines `GET /api/attendance`. |
| `backend/src/app.js` | Mounts the route at `/api/attendance`. |
| `backend/src/middleware/errorHandler.js` | Sends every error to the client as JSON. |
| `backend/src/server.js` | Loads `.env` and refuses to start if a required variable is missing. |
| `backend/.env.example` | Template listing the variable names (no values). |

## 3. Google Cloud setup (one-time)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create or select the project.
2. Go to **APIs & Services > Library**, search for **Google Sheets API** and click **Enable**.
3. Go to **IAM & Admin > Service Accounts > Create service account**. Give it a name (for example `attendance-backend`). No project roles are needed.
4. Open the service account, go to **Keys > Add key > Create new key > JSON**. A JSON file downloads. Store it outside the repository.
5. Copy the service account email from the JSON (`client_email`, ending in `.iam.gserviceaccount.com`).
6. Open the attendance spreadsheet, click **Share**, paste that email and give it **Viewer** access. Use Editor only if the backend must write in the future.
7. Copy the spreadsheet ID from the sheet URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

## 4. Environment variables

Create `backend/.env` (copy `backend/.env.example`). Never commit this file.

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default `5000`). |
| `FRONTEND_URL` | Allowed frontend origin for CORS, e.g. `http://localhost:5173`. |
| `GOOGLE_CLIENT_EMAIL` | `client_email` from the service account JSON. |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON, in double quotes, on **one line**, keeping the `\n` characters. |
| `SPREADSHEET_ID` | The ID from the spreadsheet URL. |
| `SHEET_RANGE` | Tab and range to read, e.g. `Sheet1!A1:Z`. Tab names with spaces need single quotes: `'Attendance Sheet'!A1:Z`. |

Example (values are placeholders):

```dotenv
PORT=5000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_EMAIL=attendance-backend@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your_spreadsheet_id
SHEET_RANGE=Sheet1!A1:Z
```

If any of the four Google variables is missing or empty, the server prints `Missing env variables: ...` and exits.

## 5. Running and connecting

1. From the repo root:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. You should see `Server running on http://localhost:5000`.
3. Check the server: `GET http://localhost:5000/api/health`
4. Read the attendance data: `GET http://localhost:5000/api/attendance`(empty for now)

On Windows PowerShell, use `curl.exe` (not `curl`):

```powershell
curl.exe -i http://localhost:5000/api/attendance
```

## 6. API endpoint

### `GET /api/attendance`

Returns the rows in `SHEET_RANGE` as an array of arrays (the first row is usually the header).

**Success: `200`**

```json
[
  ["Name", "Date", "Status"],
  ["Jane Doe", "2026-11-17", "Present"]
]
```

**Error response (all errors):**

```json
{ "status": "error", "message": "Google authentication failed" }
```

## 7. Error handling

Google errors are mapped to clean messages. The full Google error is logged in the server terminal only and is never sent to the client.

| Status | Message | Cause |
|---|---|---|
| `400` | Invalid spreadsheet range | `SHEET_RANGE` points to a tab or range that does not exist. |
| `401` | Google authentication failed | Wrong or malformed `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY`, key deleted or disabled, or the computer clock is out of sync. |
| `403` | No permission to access the spreadsheet | The spreadsheet is not shared with the service account, or the Sheets API is not enabled. |
| `404` | Spreadsheet or range not found | Wrong `SPREADSHEET_ID`. |
| `502` | Could not reach Google Sheets API | No internet connection or Google API unreachable. |
| (startup) | `Missing env variables: ...` | A required variable is missing from `.env`. The server does not start. |



## 8. Security rules

- `.env` and any service account JSON file must **never** be committed. `.env` is listed in `.gitignore`; only `.env.example` (empty values) is committed.
- Never paste the private key into chat, email, tickets, pull requests or screenshots. Share credentials with teammates through a password manager.
- Keep the service account at **Viewer** access on the spreadsheet.
- Delete the downloaded JSON key file after copying the two values into `.env`.
- If a key is ever exposed or committed, rotate it immediately (section 10).

## 9. Rotating the key

1. In Google Cloud Console go to **IAM & Admin > Service Accounts**, open the service account, then **Keys**.
2. Click **Add key > Create new key > JSON**.
3. Replace `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env` with the new values.
4. Restart the server and confirm `GET /api/attendance` returns `200`.
5. Delete the old key in the Keys tab.
6. Delete the downloaded JSON file.

## 10. Using a different spreadsheet

1. Share the new spreadsheet with the service account email (Viewer).
2. Update `SPREADSHEET_ID` and `SHEET_RANGE` in `.env`.
3. Restart the server.

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `Missing env variables` even though `.env` has values | `.env` must be in the `backend/` folder, named exactly `.env`, and saved. Run the server from `backend/`. |
| Changed `.env` but nothing changed | nodemon does not restart on `.env` edits. Stop the server (`Ctrl+C`) and run `npm run dev` again. |
| `401` with correct-looking values | Re-copy the key from the JSON, keeping the quotes and `\n` characters on one line. Check the key still exists in Cloud Console. Sync the computer clock. |
| `401` after fixing `.env` | If `GOOGLE_CLIENT_EMAIL` or `GOOGLE_PRIVATE_KEY` are set as system environment variables, they override `.env`. Remove them and open a new terminal. |
| `403` | Share the sheet with the service account email, and confirm the Google Sheets API is enabled for the project. |
| `404` | Check `SPREADSHEET_ID` and that the tab name in `SHEET_RANGE` matches the real tab. |
| PowerShell asks for `Uri:` | Use `curl.exe` instead of `curl`. |
