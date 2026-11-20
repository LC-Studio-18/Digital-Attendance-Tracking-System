import {
  sortAttendanceRecords,
  buildAttendanceHistoryResponse,
} from '../utils/attendanceResponse.js';
import {
  AttendanceFilterError,
  filterAttendanceRecords,
  getRecordFirebaseUid,
  parseAttendanceFilters,
} from '../utils/attendanceFilters.js';
import { fetchAttendanceRecords } from '../services/googleSheetsService.js';

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { uid, role } = req.user;

    // Preserve the existing 403 behaviour for verified but unsupported roles.
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid role',
      });
    }

    // Validate filters before reading from Google Sheets.
    let filters;

    try {
      filters = parseAttendanceFilters(req.query);
    } catch (err) {
      if (err instanceof AttendanceFilterError) {
        return res.status(err.status).json({
          success: false,
          message: err.message,
        });
      }
      throw err;
    }

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
    // Staff never use a client-supplied employeeId: their authenticated UID
    // is the only identity allowed to scope their results.
    const roleScopedRecords =
      role === 'admin'
        ? attendanceRecords
        : attendanceRecords.filter(
            (record) => getRecordFirebaseUid(record) === uid,
          );

    const effectiveFilters =
      role === 'staff' ? { ...filters, employeeId: null } : filters;

    // Filter before sorting and pagination so totals and pages describe the
    // matching records only.
    const filteredRecords = filterAttendanceRecords(
      roleScopedRecords,
      effectiveFilters,
    );

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
