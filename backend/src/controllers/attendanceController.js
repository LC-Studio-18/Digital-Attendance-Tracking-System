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
import * as sheetsService from '../services/sheets.js';

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

const toCamelCase = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-z0-9]/g, '');

const mapSheetRowsToRecords = (rows) => {
  if (!Array.isArray(rows) || rows.length <= 1) {
    return [];
  }

  const [headers, ...dataRows] = rows;
  const cleanedHeaders = headers.map((h) => String(h ?? '').trim());

  return dataRows
    .filter(
      (row) =>
        Array.isArray(row) &&
        row.some((cell) => String(cell ?? '').trim() !== ''),
    )
    .map((row) => {
      const record = {};

      cleanedHeaders.forEach((rawHeader, index) => {
        if (!rawHeader) return;

        const rawStr =
          row[index] === undefined || row[index] === null
            ? ''
            : String(row[index]).trim();
        const cellValue = /^-?\d+$/.test(rawStr) ? Number(rawStr) : rawStr;
        const lowerHeader = rawHeader.toLowerCase();
        const camelHeader = toCamelCase(rawHeader);

        record[rawHeader] = cellValue;
        if (!(lowerHeader in record)) {
          record[lowerHeader] = cellValue;
        }
        if (camelHeader && !(camelHeader in record)) {
          record[camelHeader] = cellValue;
        }
      });

      return record;
    });
};

/**
 * Supports:
 * 1. New `sheets.js` (`getAttendance()` returning 2D sheet rows)
 * 2. Legacy/mocked service methods (`getRecordsByRole` or `fetchAttendanceRecords`)
 */
const fetchRoleScopedRecords = async (user, role) => {
  if (typeof sheetsService.getRecordsByRole === 'function') {
    return sheetsService.getRecordsByRole(user);
  }

  let records;

  if (typeof sheetsService.getAttendance === 'function') {
    const rawRows = await sheetsService.getAttendance();
    records = mapSheetRowsToRecords(rawRows);
  } else if (typeof sheetsService.fetchAttendanceRecords === 'function') {
    records = await sheetsService.fetchAttendanceRecords();
  } else {
    throw new Error(
      'No compatible attendance retrieval method found in sheets service.',
    );
  }

  if (role === 'admin') {
    return records;
  }

  const allowedEmployeeIds = new Set(
    [user.employeeId, user.employee_id, user.staffId]
      .filter(Boolean)
      .map((id) => String(id).trim().toLowerCase()),
  );

  return records.filter((record) => {
    const uidMatch = getRecordFirebaseUid(record) === user.uid;
    const recordEmployeeId = String(
      record.employeeId ?? record.employee_id ?? record.staffId ?? '',
    )
      .trim()
      .toLowerCase();
    const employeeMatch =
      allowedEmployeeIds.size > 0 && allowedEmployeeIds.has(recordEmployeeId);

    return uidMatch || employeeMatch;
  });
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

    // Role scoping comes from the service/adapter. Staff never honour a
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