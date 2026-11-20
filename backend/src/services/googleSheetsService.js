import { google } from 'googleapis';

let sheetsClient = null;

function initSheets() {
  if (sheetsClient) return sheetsClient;

  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID } = process.env;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !SPREADSHEET_ID) {
    console.warn('Google Sheets credentials not set — write will fail till added');
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (err) {
    console.error('Failed to initialize Google Sheets client:', err.message);
    return null;
  }
}

function classifyAndThrow(err, action) {
  console.error(`Google Sheets ${action} error:`, err.message);
  console.error('Google API details:', JSON.stringify(err.response?.data, null, 2));

  const code = err.code || err.response?.status;

  if (code === 401 || err.message?.includes('invalid_grant') || err.message?.includes('DECODER')) {
    throw Object.assign(new Error('Google authentication failed'), { status: 401 });
  }
  if (code === 403) {
    throw Object.assign(new Error('No permission to access the spreadsheet'), { status: 403 });
  }
  if (code === 400) {
    throw Object.assign(new Error('Invalid spreadsheet range'), { status: 400 });
  }
  if (code === 404) {
    throw Object.assign(new Error('Spreadsheet or range not found'), { status: 404 });
  }

  throw Object.assign(new Error('Google Sheets request failed'), { status: 502 });
}

export async function appendRow(sheetName, rowValues) {
  const sheets = initSheets();

  if (!sheets) {
    throw Object.assign(new Error('Google Sheets is not configured'), { status: 503 });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    });
  } catch (err) {
    classifyAndThrow(err, 'write');
  }
}

export async function getRows(sheetName, range = 'A:F') {
  const sheets = initSheets();

  if (!sheets) {
    throw Object.assign(new Error('Google Sheets is not configured'), { status: 503 });
  }

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });
    return result.data.values || [];
  } catch (err) {
    classifyAndThrow(err, 'read');
  }
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