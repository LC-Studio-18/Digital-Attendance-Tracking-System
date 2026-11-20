/**
 * Parsing and filtering helpers for GET /api/attendance.
 *
 * Google Sheets cell values arrive as strings (for example "2026-11-18"),
 * so dates are normalised to canonical YYYY-MM-DD strings and compared as
 * strings. No JavaScript Date parsing is used for spreadsheet values.
 */

const DATE_PARAM_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const RECORD_DATE_PATTERN = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/;
const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@-]*$/;
const MAX_EMPLOYEE_ID_LENGTH = 128;

const FIREBASE_UID_KEYS = ['uid', 'user_id', 'user id (firebase uid)'];
const EMPLOYEE_ID_KEYS = [
  ...FIREBASE_UID_KEYS,
  'employeeId',
  'employeeID',
  'employeeid',
  'employee_id',
  'employee id',
];

export class AttendanceFilterError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AttendanceFilterError';
    this.status = 400;
  }
}

const isLeapYear = (year) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const daysInMonth = (year, month) =>
  [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

const normalizeDateParts = (year, month, day) => {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) {
    return null;
  }

  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const firstNonEmptyValue = (record, keys) => {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
};

/** UID used for staff access control (same keys as the original controller). */
export const getRecordFirebaseUid = (record) =>
  firstNonEmptyValue(record, FIREBASE_UID_KEYS);

/** Employee identifier used for the admin-only employeeId filter. */
export const getRecordEmployeeId = (record) =>
  firstNonEmptyValue(record, EMPLOYEE_ID_KEYS);

/**
 * Validate one query date and return its canonical YYYY-MM-DD form.
 * Blank values are treated as "parameter not supplied".
 */
export const parseDateParam = (value, paramName = 'date') => {
  const invalidMessage = `Bad Request: Invalid ${paramName}. Use YYYY-MM-DD.`;

  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AttendanceFilterError(invalidMessage);
  }

  const match = DATE_PARAM_PATTERN.exec(value.trim());
  const normalized = match
    ? normalizeDateParts(match[1], match[2], match[3])
    : null;

  if (!normalized) {
    throw new AttendanceFilterError(invalidMessage);
  }

  return normalized;
};

/** Validate employeeId. Blank values are treated as "parameter not supplied". */
export const parseEmployeeIdParam = (value) => {
  const invalidMessage = 'Bad Request: Invalid employeeId.';

  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AttendanceFilterError(invalidMessage);
  }

  const employeeId = value.trim();

  if (
    !employeeId ||
    employeeId.length > MAX_EMPLOYEE_ID_LENGTH ||
    !EMPLOYEE_ID_PATTERN.test(employeeId)
  ) {
    throw new AttendanceFilterError(invalidMessage);
  }

  return employeeId;
};

/** Validate and normalise all supported filter query parameters. */
export const parseAttendanceFilters = (query = {}) => {
  const date = parseDateParam(query.date, 'date');
  const startDate = parseDateParam(query.startDate, 'startDate');
  const endDate = parseDateParam(query.endDate, 'endDate');
  const employeeId = parseEmployeeIdParam(query.employeeId);

  if (date && (startDate || endDate)) {
    throw new AttendanceFilterError(
      'Bad Request: Use either date or startDate/endDate, not both.',
    );
  }

  if (startDate && endDate && startDate > endDate) {
    throw new AttendanceFilterError(
      'Bad Request: Invalid date range. startDate must be on or before endDate.',
    );
  }

  return { date, startDate, endDate, employeeId };
};

/**
 * Convert a spreadsheet date cell to a comparable YYYY-MM-DD string.
 * Returns null for missing or unrecognised formats; such records never match
 * a date filter but are still returned when no date filter is supplied.
 */
export const normalizeRecordDate = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const match = RECORD_DATE_PATTERN.exec(String(value).trim());

  return match
    ? normalizeDateParts(match[1], match[2], match[3])
    : null;
};

/** Apply employee and date filters. Does not sort or paginate. */
export const filterAttendanceRecords = (records = [], filters = {}) => {
  const { date, startDate, endDate, employeeId } = filters;
  const hasDateFilter = Boolean(date || startDate || endDate);

  if (!employeeId && !hasDateFilter) {
    return records;
  }

  return records.filter((record) => {
    if (employeeId && getRecordEmployeeId(record) !== employeeId) {
      return false;
    }

    if (!hasDateFilter) {
      return true;
    }

    const recordDate = normalizeRecordDate(record?.date);

    if (!recordDate) {
      return false;
    }

    if (date) {
      return recordDate === date;
    }

    if (startDate && recordDate < startDate) {
      return false;
    }

    if (endDate && recordDate > endDate) {
      return false;
    }

    return true;
  });
};
