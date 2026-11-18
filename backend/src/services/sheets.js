import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const sheetsServiceAccount = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const authClient = new google.auth.GoogleAuth({
  credentials: sheetsServiceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth: authClient });

export async function appendAttendanceRow({ userID, name, status, timestamp }) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: process.env.SHEET_RANGE || 'Sheet1!A1:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[userID, name, status, timestamp]],
    },
  });
}