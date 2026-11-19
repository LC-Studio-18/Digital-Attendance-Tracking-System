import { google } from 'googleapis';

const fail = (status, message) => Object.assign(new Error(message), { status });

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

function toHttpError(err) {
  console.error('Google Sheets error:', err.message);
  const code = err.code || err.response?.status;
  if (code === 401 || err.message?.includes('invalid_grant') || err.message?.includes('DECODER')) {
    return fail(401, 'Google authentication failed');
  }
  if (code === 403) return fail(403, 'No permission to access the spreadsheet');
  if (code === 400) return fail(400, 'Invalid spreadsheet range');
  if (code === 404) return fail(404, 'Spreadsheet or range not found');
  return fail(502, 'Could not reach Google Sheets API');
}

export async function getAttendance() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_RANGE,
    });
    return res.data.values || [];
  } catch (err) {
    throw toHttpError(err);
  }
}

// Staff tab: A employeeId, B uid, C name, D active, E status
export async function getStaffMember(uid) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Staff!A2:E',
    });
    const rows = res.data.values || [];
    const i = rows.findIndex((r) => r[1] === uid);
    if (i === -1) return null;
    const [employeeId, , name, active, status] = rows[i];
    return {
      employeeId,
      name,
      active: String(active).toUpperCase() === 'TRUE',
      status: String(status || '').toUpperCase(),
      rowNumber: i + 2, // +1 for the header row, +1 because sheet rows start at 1
    };
  } catch (err) {
    throw toHttpError(err);
  }
}
// Attendance tab: A timestamp, B employeeId, C uid, D name, E locationId
export async function recordClockIn({ employeeId, uid, name, locationId, timestamp, rowNumber }) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Attendance!A:E',
      valueInputOption: 'RAW',
      requestBody: { values: [[timestamp, employeeId, uid, name, locationId]]},
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Staff!E${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['IN']] },
    });
  } catch (err) {
    throw toHttpError(err);
  }
}