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

// Employees tab: A uid, B employeeId, C name, D email, E department, F role, G status (Active/Inactive)
// Attendance tab: A eventId, B timestamp, C uid, D eventType (Clock In/Clock Out), E location, F comment
// Attendance status is not stored: it is the uid's latest Attendance event.
export async function getStaffMember(uid) {
  try {
    const read = (range) =>
      sheets.spreadsheets.values.get({ spreadsheetId: process.env.SPREADSHEET_ID, range });
    const [employees, attendance] = await Promise.all([
      read('Employees!A2:G'),
      read('Attendance!A2:F'),
    ]);

    const row = (employees.data.values || []).find((r) => r[0] === uid);
    if (!row) return null;

    const events = (attendance.data.values || []).filter((r) => r[2] === uid);
    const last = String(events.at(-1)?.[3] || '').trim().toUpperCase();

    return {
      employeeId: row[1],
      name: row[2],
      active: String(row[6]).trim().toUpperCase() === 'ACTIVE',
      status: last === 'CLOCK IN' ? 'IN' : 'OUT',
    };
  } catch (err) {
    throw toHttpError(err);
  }
}

// The new row is also what marks the employee as IN.
export async function recordClockIn({ employeeId, uid, locationId, timestamp }) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Attendance!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        // employee ID goes in the Comment column because the tab has no Employee ID column
        values: [[`att-${Date.now()}`, timestamp, uid, 'Clock In', locationId, employeeId]],
      },
    });
  } catch (err) {
    throw toHttpError(err);
  }
}