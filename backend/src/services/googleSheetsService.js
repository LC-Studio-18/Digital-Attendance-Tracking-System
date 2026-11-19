
import { google } from 'googleapis';
import { randomUUID } from 'crypto';

let sheetsClient = null;

function initSheets() {
  if (sheetsClient) return sheetsClient;

  const {
    GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY,
    GOOGLE_SHEETS_SPREADSHEET_ID,
  } = process.env;

  if (
    !GOOGLE_SHEETS_CLIENT_EMAIL ||
    !GOOGLE_SHEETS_PRIVATE_KEY ||
    !GOOGLE_SHEETS_SPREADSHEET_ID
  ) {
    const error = new Error('Google Sheets is not configured');
    error.status = 503;
    throw error;
  }

  const auth = new google.auth.JWT(
    GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function appendAttendanceRow({
  userID,
  eventType,
  timestamp = new Date().toISOString(),
  locationId,
  comment = 'QR scan',
}) {
  const sheets = initSheets();

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Attendance!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          randomUUID(),
          timestamp,
          userID,
          eventType,
          locationId,
          comment,
        ]],
      },
    });
  } catch (err) {
    console.error('Google Sheets append error:', err.message);
    const error = new Error('Google Sheets request failed');
    error.status = 502;
    throw error;
  }
}

export async function getRows(range = 'A:F') {
  const sheets = initSheets();

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `Attendance!${range}`,
    });

    return result.data.values || [];
  } catch (err) {
    console.error('Google Sheets read error:', err.message);
    const error = new Error('Google Sheets request failed');
    error.status = 502;
    throw error;
  }
}

export async function findTodayCheckin(userId) {
  const rows = await getRows();
  const today = new Date().toISOString().slice(0, 10);

  return rows.some((row) =>
    row[2] === userId &&
    row[3] === 'Clock-in' &&
    row[1]?.startsWith(today)
  );
}
