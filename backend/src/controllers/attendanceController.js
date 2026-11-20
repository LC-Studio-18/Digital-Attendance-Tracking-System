import {
  sortAttendanceRecords,
  buildAttendanceHistoryResponse,
} from '../utils/attendanceResponse.js';
import { getRecordsByRole } from '../services/googleSheetsService.js';

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

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { role } = req.user;

    // Validate role before querying Google Sheets
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid role',
      });
    }

    const page = parsePositiveInteger(req.query.page, DEFAULT_PAGE);
    const requestedLimit = parsePositiveInteger(req.query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);

    // Fetch normalized records filtered by role (admin = all, staff = matched via Employees tab / UID)
    const filteredRecords = await getRecordsByRole(req.user);

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
