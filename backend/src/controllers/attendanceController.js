import { sheetsClient, spreadsheetId } from '../config/googleSheets.js';

const EMPLOYEES_RANGE = 'Employees!A:G';
const ATTENDANCE_RANGE = 'Attendance!A:F'; // Fallback or log tab

export const getAttendanceRecords = async (req, res, next) => {
  try {
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: EMPLOYEES_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Map rows from the Employees sheet
    const employees = rows.slice(1).map((row, index) => ({
      id: row[0] || `emp-${index}`,
      employeeId: row[1] || '',
      fullName: row[2] || '',
      email: row[3] || '',
      department: row[4] || '',
      role: row[5] || 'Staff',
      status: row[6] || 'Active',
    }));

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    const error = new Error(`Failed to retrieve data from Google Sheets: ${err.message}`);
    error.status = 502;
    next(error);
  }
};

export const handleCheckIn = async (req, res, next) => {
  try {
    const { qrCode, staffName } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'Bad Request: QR code data is required (Employee ID)' });
    }

    // Verify employee exists and is active in the Employees tab
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: EMPLOYEES_RANGE,
    });

    const rows = response.data.values || [];
    const employeeRow = rows.slice(1).find(row => row[1] === qrCode);

    if (!employeeRow) {
      return res.status(404).json({ error: `Employee not found for ID: ${qrCode}` });
    }

    const status = employeeRow[6] || 'Active';
    if (status.toLowerCase() === 'inactive') {
      return res.status(403).json({ error: 'Forbidden: Staff account is inactive' });
    }

    const checkInRecord = [
      `att-${Date.now()}`,
      employeeRow[1], // Employee ID
      employeeRow[2], // Full Name
      'checked-in',
      new Date().toISOString(),
      ''
    ];

    // Append to Attendance sheet log
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
    const error = new Error(`Failed to sync check-in with Google Sheets: ${err.message}`);
    error.status = 502;
    next(error);
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
    const error = new Error(`Failed to sync check-out with Google Sheets: ${err.message}`);
    error.status = 502;
    next(error);
  }
};
