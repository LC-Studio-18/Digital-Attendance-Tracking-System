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
import * as attendanceService from '../services/googleSheetsService.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInteger = (value, fallback) => {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Prefer the current role-aware service helper. The fetchAttendanceRecords
 * fallback preserves compatibility with the in-memory test doubles that were
 * written before role-based fetching was added; those rows still need the
 * legacy UID-based role scoping here.
 */
const fetchRoleScopedRecords = async (user, role) => {
  if (typeof attendanceService.getRecordsByRole === 'function') {
    return attendanceService.getRecordsByRole(user);
  }

  const records = await attendanceService.fetchAttendanceRecords();

  return role === 'admin'
    ? records
    : records.filter(
        (record) => getRecordFirebaseUid(record) === user.uid,
      );
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { role } = req.user;

    // Validate role before reading from Google Sheets or applying filters.
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

    const page = parsePositiveInteger(req.query.page, DEFAULT_PAGE);
    const requestedLimit = parsePositiveInteger(req.query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);

    // Role scoping comes from the service. Staff never honour a
    // client-supplied employeeId: their authenticated identity is the only
    // one allowed to scope their results.
    const roleScopedRecords = await fetchRoleScopedRecords(req.user, role);
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
    const totalPages = Math.ceil(sortedRecords.length / limit);
    const startIndex =
      page > totalPages ? sortedRecords.length : (page - 1) * limit;
    const endIndex = startIndex + limit;
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
