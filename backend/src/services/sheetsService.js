import { google } from 'googleapis';

const requiredConfig = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'SPREADSHEET_ID'];

const getConfig = () => {
  const missing = requiredConfig.filter((key) => !process.env[key]);

  if (missing.length) {
    const error = new Error(`Google Sheets configuration is missing: ${missing.join(', ')}`);
    error.status = 503;
    throw error;
  }

  return {
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    spreadsheetId: process.env.SPREADSHEET_ID,
  };
};

const normalizeHeader = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const findValue = (row, names) => {
  for (const name of names) {
    if (row[name] !== undefined) return String(row[name]).trim();
  }

  return '';
};

export const getUsers = async () => {
  const { email, key, spreadsheetId } = getConfig();
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const range = process.env.USERS_SHEET_RANGE || 'Users!A:Z';

  let response;
  try {
    response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  } catch (cause) {
    const error = new Error('Unable to read the users sheet. Check the spreadsheet ID and sharing permissions.');
    error.status = 502;
    error.cause = cause;
    throw error;
  }

  const values = response.data.values || [];
  if (values.length < 2) return [];

  const headers = values[0].map(normalizeHeader);
  if (!headers.includes('email') || !headers.some((header) => ['password', 'passcode'].includes(header))) {
    const error = new Error('The users sheet must have email and password columns.');
    error.status = 503;
    throw error;
  }

  return values.slice(1).map((valuesRow, index) => {
    const row = Object.fromEntries(headers.map((header, column) => [header, valuesRow[column]]));
    const userEmail = findValue(row, ['email']);

    return {
      id: findValue(row, ['id', 'userid']) || String(index + 2),
      email: userEmail,
      password: findValue(row, ['password', 'passcode']),
      displayName: findValue(row, ['name', 'displayname', 'fullname']) || userEmail.split('@')[0],
      role: findValue(row, ['role']) || 'user',
    };
  });
};
