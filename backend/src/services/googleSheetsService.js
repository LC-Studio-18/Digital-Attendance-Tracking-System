import { google } from 'googleapis';

let sheetsClient = null;

function initSheets() {
  if (sheetsClient) return sheetsClient;

  const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID } = process.env;

  if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_SPREADSHEET_ID) {
    console.warn('Google Sheets credentials not set — write will fail till added');
    return null;
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

export async function appendRow(sheetName, rowValues) {
  const sheets = initSheets();

  if (!sheets) {
    const error = new Error('Google Sheets is not configured');
    error.status = 503;
    throw error;
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    });
  } catch (err) {
    const error = new Error('Google Sheets request failed');
    error.status = 502;
    throw error;
  }
}