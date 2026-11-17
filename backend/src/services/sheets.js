
import { google } from 'googleapis';

const fail = (status, message) => Object.assign(new Error(message), { status });

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
    console.error('Google Sheets error:', err.message);
    const code = err.code || err.response?.status;
    if (code === 401 || err.message?.includes('invalid_grant')) {
      throw fail(401, 'Google authentication failed');
    }
    if (code === 403) {
      throw fail(403, 'No permission to access the spreadsheet');
    }
    if (code === 404) {
      throw fail(404, 'Spreadsheet or range not found');
    }
    throw fail(502, 'Could not reach Google Sheets API');
  }
}
