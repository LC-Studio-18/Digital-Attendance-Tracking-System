
import { google } from 'googleapis';

const fail = (status, message) =>
  Object.assign(new Error(message), { status });

// Google Sheets authentication
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Get all attendance records
export async function getAttendance() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_RANGE || 'Attendance!A:G',
    });

    return res.data.values || [];
  } catch (err) {
    console.error('Google Sheets error:', err.message);

    const code = err.code || err.response?.status;

    if (
      code === 401 ||
      err.message?.includes('invalid_grant') ||
      err.message?.includes('DECODER')
    ) {
      throw fail(401, 'Google authentication failed');
    }

    if (code === 403) {
      throw fail(403, 'No permission to access the spreadsheet');
    }

    if (code === 400) {
      throw fail(400, 'Invalid spreadsheet range');
    }

    if (code === 404) {
      throw fail(404, 'Spreadsheet or range not found');
    }

    throw fail(502, 'Could not reach Google Sheets API');
  }
}

// Get rows from a specified sheet
export async function getRows(sheetName, range = 'A:F') {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });

    return res.data.values || [];
  } catch (err) {
    console.error('Google Sheets error:', err.message);

    const code = err.code || err.response?.status;

    if (
      code === 401 ||
      err.message?.includes('invalid_grant') ||
      err.message?.includes('DECODER')
    ) {
      throw fail(401, 'Google authentication failed');
    }

    if (code === 403) {
      throw fail(403, 'No permission to access the spreadsheet');
    }

    if (code === 400) {
      throw fail(400, 'Invalid spreadsheet range');
    }

    if (code === 404) {
      throw fail(404, 'Spreadsheet or range not found');
    }

    throw fail(502, 'Could not reach Google Sheets API');
  }
}

// Append a new attendance record
export async function appendAttendanceRow({
  employeeId,
  uid,
  timestamp,
  eventType,
  location = '',
  comment = '',
}) {
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Attendance!A:G',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          '',
          timestamp,
          employeeId || '',
          uid,
          eventType,
          location,
          comment,
        ]],
      },
    });

    return res.data;
  } catch (err) {
    console.error('Google Sheets append error:', err.message);

    const code = err.code || err.response?.status;

    if (code === 401 || err.message?.includes('invalid_grant')) {
      throw fail(401, 'Google authentication failed');
    }

    if (code === 403) {
      throw fail(403, 'No permission to write to the spreadsheet');
    }

    if (code === 400) {
      throw fail(400, 'Invalid attendance spreadsheet range or data');
    }

    throw fail(502, 'Could not save attendance to Google Sheets');
  }
}
