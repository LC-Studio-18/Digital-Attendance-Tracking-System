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

// --- Task 03: Role-Based Fetching Helpers ---

const extractDateOnly = (value) => {
  if (!value) return '';
  const match = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

export const normalizeAttendanceRow = (row) => {
  const colA = row[0]?.trim() || '';
  const colB = row[1]?.trim() || '';
  const colC = row[2]?.trim() || '';
  const colD = row[3]?.trim() || '';
  const colE = row[4]?.trim() || '';
  const colF = row[5]?.trim() || '';

  const isEmpRow = /^EMP\d+/i.test(colB);

  if (isEmpRow) {
    const rawTimestamp = colF || colE;
    return {
      eventId: colA,
      employeeId: colB,
      employeeName: colC,
      eventType: colD,
      clockIn: colE,
      clockOut: colF,
      timestamp: rawTimestamp,
      date: extractDateOnly(rawTimestamp),
    };
  }

  const rawTimestamp = extractDateOnly(colB) ? colB : colC;
  return {
    eventId: colA,
    employeeId: colA === 'testUser' ? 'testUser' : '',
    employeeName: colC && !extractDateOnly(colC) ? colC : colA === 'testUser' ? 'testUser' : '',
    eventType: colD || (colB === 'IN' ? 'IN' : ''),
    location: colE,
    comment: colF,
    timestamp: rawTimestamp,
    date: extractDateOnly(rawTimestamp),
  };
};

const resolveEmployeeIdForUser = async (spreadsheetId, user) => {
  if (!user) return null;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: formatSheetRange('Employees', 'A2:Z'),
    });

    const rows = res.data.values || [];
    const matchedRow = rows.find((row) =>
      row.some((cell) => {
        const val = cell?.trim();
        if (!val) return false;
        return (
          val === user.uid ||
          (user.email && val.toLowerCase() === user.email.toLowerCase())
        );
      })
    );

    return matchedRow ? matchedRow[0]?.trim() || null : null;
  } catch (err) {
    // Fallback if Employees tab is inaccessible or doesn't exist
    return null;
  }
};

export const getRecordsByRole = async (user) => {
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Missing SPREADSHEET_ID in environment variables');
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: formatSheetRange('Attendance', 'A2:F'),
  });

  const allRecords = (response.data.values || [])
    .filter((row) => row.some((cell) => cell && cell.trim() !== ''))
    .map(normalizeAttendanceRow);

  const isAdmin = user?.admin === true || user?.role === 'admin';
  if (isAdmin) {
    return allRecords;
  }

  const mappedEmployeeId = await resolveEmployeeIdForUser(spreadsheetId, user);

  return allRecords.filter((rec) => {
    if (mappedEmployeeId && rec.employeeId === mappedEmployeeId) return true;
    if (user?.uid && rec.employeeId === user.uid) return true;
    return false;
  });
};