import {
  sortAttendanceRecords,
  buildAttendanceHistoryResponse,
} from '../utils/attendanceResponse.js';
import { fetchAttendanceRecords } from '../services/googleSheetsService.js';

const getRecordUid = (record) =>
  record.uid ?? record.user_id ?? record['user id (firebase uid)'] ?? '';

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { uid, role } = req.user;

    // Clamp pagination parameters to at least 1 so negative/zero values never slice backwards
    const rawPage = parseInt(req.query.page, 10);
    const rawLimit = parseInt(req.query.limit, 10);
    const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
    const limit = Number.isNaN(rawLimit) ? 50 : Math.max(1, rawLimit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Fetch live records from Google Sheets
    const attendanceRecords = await fetchAttendanceRecords();

    // Admins can view all records; staff can view only their own.
    let filteredRecords;

    if (role === 'admin') {
      filteredRecords = attendanceRecords;
    } else if (role === 'staff') {
      filteredRecords = attendanceRecords.filter(
        (record) => getRecordUid(record) === uid,
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid role',
      });
    }

    // Sort newest first before applying pagination
    const sortedRecords = sortAttendanceRecords(filteredRecords);
    const paginatedData = sortedRecords.slice(startIndex, endIndex);

    const response = buildAttendanceHistoryResponse({
      records: paginatedData,
      totalRecords: sortedRecords.length,
      page,
      limit,
    });

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};