import 'dotenv/config';
import { google } from 'googleapis';

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getAttendance() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_RANGE,
    });
    return res.data.values || [];
  } catch (err) {
    const code = err.code || err.response?.status;
    if (code === 401 || err.message?.includes('invalid_grant')) {
      throw { status: 401, message: 'Google authentication failed' };
    }
    if (code === 403) {
      throw { status: 403, message: 'No permission to access the spreadsheet' };
    }
    if (code === 404) {
      throw { status: 404, message: 'Spreadsheet or range not found' };
    }
    throw { status: 502, message: 'Could not reach Google Sheets API' };
  }
}
