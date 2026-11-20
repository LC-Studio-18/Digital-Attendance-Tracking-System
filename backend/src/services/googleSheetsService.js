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
    const auth = new google.auth.JWT(
      GOOGLE_CLIENT_EMAIL,
      null,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (err) {
    console.error('Failed to initialize Google Sheets client:', err.message);
    return null;
  }
}

export async function appendRow(sheetName, rowValues) {
  const sheets = initSheets();

  if (!sheets) {
    const error = new Error('Google Sheets is not configured');
    error.status = 503;
    throw error;
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    });
  } catch (err) {
    console.error('Google Sheets write error:', err.message);
    console.error('Google API details:', JSON.stringify(err.response?.data, null, 2));

    const error = new Error('Google Sheets request failed');
    error.status = 502;
    throw error;
  }
}

export async function getRows(sheetName, range = 'A:F') {
  const sheets = initSheets();

  if (!sheets) {
    const error = new Error('Google Sheets is not configured');
    error.status = 503;
    throw error;
  }

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });
    return result.data.values || [];
  } catch (err) {
    console.error('Google Sheets read error:', err.message);
    console.error('Google API details:', JSON.stringify(err.response?.data, null, 2));

    const error = new Error('Google Sheets request failed');
    error.status = 502;
    throw error;
  }
}

export async function findTodayCheckin(sheetName, userId) {
  const rows = await getRows(sheetName);
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Attendance columns: Event ID, Timestamp, User ID, Event Type, Location, Comment
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
