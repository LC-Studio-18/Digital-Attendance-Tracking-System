import { sheetsClient, spreadsheetId } from '../config/googleSheets.js';

const EMPLOYEES_RANGE = 'Employees!A:G';
const ATTENDANCE_RANGE = 'Attendance!A:F';

function mapSheetsError(err, fallback500Message) {
  const msg = (err?.message || '').toLowerCase();
  const code = err?.code || err?.response?.status;

  // 503: Google Sheets cannot be reached / unavailable[cite: 1, 2]
  if (
    code === 503 ||
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    msg.includes('unavailable') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('network')
  ) {
    const error = new Error('Attendance data is temporarily unavailable. Please try again later.'); //[cite: 2]
    error.status = 503; //[cite: 1, 2]
    return error;
  }

  // 500: Attendance sheet or required data is missing / inaccessible[cite: 1, 2]
  if (
    code === 404 ||
    code === 403 ||
    msg.includes('unable to parse range') ||
    msg.includes('requested entity was not found') ||
    msg.includes('not found') ||
    msg.includes('permission') ||
    msg.includes('spreadsheet')
  ) {
    const error = new Error('Attendance records could not be retrieved due to a configuration issue.'); //[cite: 2]
    error.status = 500; //[cite: 1, 2]
    return error;
  }

  // 500: Google Sheets returns an unexpected error[cite: 1, 2]
  const error = new Error(fallback500Message);
  error.status = 500; //[cite: 1, 2]
  return error;
}

export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { date, status: statusFilter } = req.query;

    if (date !== undefined && (typeof date !== 'string' || Number.isNaN(Date.parse(date)))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date or filter provided. Please check your request.', //[cite: 2]
      });
    }

    if (statusFilter !== undefined && typeof statusFilter !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid date or filter provided. Please check your request.', //[cite: 2]
      });
    }

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: EMPLOYEES_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        attendance: [], //[cite: 2]
        data: [],
      });
    }

    // Map rows from the Employees sheet and exclude deactivated (Inactive) employees
    let activeEmployees = rows
      .slice(1)
      .map((row = [], index) => ({
        id: String(row[0] ?? `emp-${index}`).trim() || `emp-${index}`,
        employeeId: String(row[1] ?? '').trim(),
        fullName: String(row[2] ?? '').trim(),
        email: String(row[3] ?? '').trim(),
        department: String(row[4] ?? '').trim(),
        role: String(row[5] ?? 'Staff').trim() || 'Staff',
        status: String(row[6] ?? 'Active').trim() || 'Active',
      }))
      .filter((emp) => emp.status.toLowerCase() !== 'inactive');

    if (statusFilter) {
      const normalizedFilter = statusFilter.trim().toLowerCase();
      if (!normalizedFilter) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date or filter provided. Please check your request.', //[cite: 2]
        });
      }
      activeEmployees = activeEmployees.filter(
        (emp) => emp.status.toLowerCase() === normalizedFilter
      );
    }

    return res.status(200).json({
      success: true,
      count: activeEmployees.length,
      attendance: activeEmployees, //[cite: 2]
      data: activeEmployees,
    });
  } catch (err) {
    next(mapSheetsError(err, 'Unable to retrieve attendance records. Please try again later.')); //[cite: 2]
  }
};

export const handleCheckIn = async (req, res, next) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'Bad Request: QR code data is required (Employee ID)' });
    }

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: EMPLOYEES_RANGE,
    });

    const rows = response.data.values || [];
    const employeeRow = rows.slice(1).find((row) => row[1] === qrCode);

    if (!employeeRow) {
      return res.status(404).json({ error: `Employee not found for ID: ${qrCode}` });
    }

    const status = String(employeeRow[6] ?? 'Active').trim();
    if (status.toLowerCase() === 'inactive') {
      return res.status(403).json({ error: 'Forbidden: Staff account is inactive' });
    }

    const checkInRecord = [
      `att-${Date.now()}`,
      employeeRow[1],
      employeeRow[2],
      'checked-in',
      new Date().toISOString(),
      '',
    ];

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: ATTENDANCE_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [checkInRecord],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Check-in recorded to Google Sheets successfully',
      data: {
        id: checkInRecord[0],
        employeeId: checkInRecord[1],
        fullName: checkInRecord[2],
        status: checkInRecord[3],
        checkInTime: checkInRecord[4],
      },
    });
  } catch (err) {
    next(mapSheetsError(err, 'Unable to retrieve attendance records. Please try again later.')); //[cite: 2]
  }
};

export const handleCheckOut = async (req, res, next) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'Bad Request: QR code data is required' });
    }

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: ATTENDANCE_RANGE,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][1] === qrCode && rows[i][3] === 'checked-in') {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return res.status(404).json({ error: `No active check-in found for Employee ID: ${qrCode}` });
    }

    const checkOutTime = new Date().toISOString();

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: `Attendance!D${rowIndex}:F${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['checked-out', rows[rowIndex - 1][4], checkOutTime]],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Check-out recorded in Google Sheets successfully',
      data: {
        employeeId: qrCode,
        status: 'checked-out',
        checkOutTime,
      },
    });
  } catch (err) {
    next(mapSheetsError(err, 'Unable to retrieve attendance records. Please try again later.')); //[cite: 2]
  }
};