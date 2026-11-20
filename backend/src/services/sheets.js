import { google } from 'googleapis';

const fail = (status, message) => Object.assign(new Error(message), { status });

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

function handleGoogleSheetsError(err) {
  console.error('Google Sheets error:', err.message);
  const code = err.code || err.response?.status;
  if (code === 401 || err.message?.includes('invalid_grant') || err.message?.includes('DECODER')) {
    throw fail(401, 'Google authentication failed');
  }
  if (code === 403) throw fail(403, 'No permission to access the spreadsheet');
  if (code === 400) throw fail(400, 'Invalid spreadsheet range');
  if (code === 404) throw fail(404, 'Spreadsheet or range not found');
  throw fail(502, 'Could not reach Google Sheets API');
}

async function request(operation) {
  try {
    return await operation();
  } catch (err) {
    handleGoogleSheetsError(err);
  }
}

export async function getAttendance() {
  const res = await request(() => sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: process.env.SHEET_RANGE,
  }));
  return res.data.values || [];
}

export async function getRows(sheetName, range = 'A:F') {
  const res = await request(() => sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
  }));
  return res.data.values || [];
}

export async function appendRow(sheetName, rowValues) {
  return request(() => sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    requestBody: { values: [rowValues] },
  }));
}

export async function findTodayCheckin(sheetName, userId) {
  const rows = await getRows(sheetName);
  const today = new Date().toISOString().slice(0, 10);
  return rows.some((row) =>
    row[2] === userId &&
    row[3]?.toLowerCase() === 'clock in' &&
    row[1]?.startsWith(today)
  );
}

export async function getUserAttendance(sheetName, userId) {
  const rows = await getRows(sheetName, 'A:F');
  const userRows = rows.filter((row) => row[2] === userId);
  const history = userRows.map((row) => ({
    timestamp: row[1] || null,
    status: row[3] || 'Present',
  }));
  const lastClockIn = userRows.reduce((latest, row) => {
    const timestamp = row[1];
    return timestamp && (!latest || timestamp > latest) ? timestamp : latest;
  }, null);
  const today = new Date().toISOString().slice(0, 10);

  return {
    name: userRows.find((row) => row[2])?.[2] || userId,
    status: userRows.some((row) => row[1]?.startsWith(today) && row[3]?.toLowerCase() === 'clock in')
      ? 'Present'
      : 'Absent',
    lastClockIn,
    lastClockOut: null,
    history,
  };
}
