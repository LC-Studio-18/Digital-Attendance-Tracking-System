import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

const formatSheetRange = (tabTitle, cellRange = 'A1:Z') => {
  const escapedTitle = tabTitle.replace(/'/g, "''");
  return `'${escapedTitle}'!${cellRange}`;
};

export const fetchAttendanceRecords = async () => {
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Missing SPREADSHEET_ID in environment variables');
  }

  let range = process.env.SHEET_RANGE;

  if (!range) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const firstTabTitle = meta.data.sheets?.[0]?.properties?.title;

    if (!firstTabTitle) {
      return [];
    }

    range = formatSheetRange(firstTabTitle);
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;

  if (!rows || rows.length <= 1) {
    return [];
  }

  const headers = rows[0].map((header) => (header ?? '').trim().toLowerCase());

  return rows.slice(1).map((row, index) => {
    const record = { id: index + 1 };

    headers.forEach((header, colIndex) => {
      if (header) {
        record[header] = row[colIndex] ?? '';
      }
    });

    return record;
  });
};