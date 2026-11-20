import { filterRecordsByDate, getField } from './csv.js';

export const DATE_FILTER_MODES = Object.freeze({
  ANY: 'any',
  SPECIFIC: 'specific',
  RANGE: 'range',
});

export const EMPTY_ATTENDANCE_FILTERS = Object.freeze({
  startDate: '',
  endDate: '',
  date: '',
  status: '',
  search: '',
  employee: '',
});

/** Which date input is active for a set of applied filters. */
export function getDateFilterMode(filters = EMPTY_ATTENDANCE_FILTERS) {
  return filters?.date ? DATE_FILTER_MODES.SPECIFIC : DATE_FILTER_MODES.RANGE;
}

/**
 * Turn the selected date mode into concrete date values. A specific date is
 * mirrored into the range fields so both the API and the client-side fallback
 * can keep using the existing inclusive range logic.
 */
export function normalizeDateFilters(
  filters = EMPTY_ATTENDANCE_FILTERS,
  mode = DATE_FILTER_MODES.RANGE
) {
  const next = { ...EMPTY_ATTENDANCE_FILTERS, ...filters };

  if (mode === DATE_FILTER_MODES.SPECIFIC) {
    const date = next.date || next.startDate || '';
    return { ...next, date, startDate: date, endDate: date };
  }

  if (mode === DATE_FILTER_MODES.ANY) {
    return { ...next, date: '', startDate: '', endDate: '' };
  }

  return { ...next, date: '' };
}

export function hasActiveFilters(filters = EMPTY_ATTENDANCE_FILTERS) {
  return Object.values(filters).some(
    (value) => value !== '' && value !== null && value !== undefined
  );
}

/** Query parameters for GET /api/v1/attendance/history. */
export function toApiParams(filters = EMPTY_ATTENDANCE_FILTERS) {
  if (!hasActiveFilters(filters)) return undefined;

  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );
}

export function getRecordStatus(record) {
  const raw = getField(record, 'status', 'state') || '—';
  const value = String(raw).toLowerCase();

  if (value.includes('in') && !value.includes('out')) return 'IN';
  if (value.includes('out')) return 'OUT';
  return String(raw).toUpperCase();
}

/** Searchable identity for an attendance record's employee. */
export function getEmployeeSearchText(record) {
  return [
    getField(record, 'staffId', 'employeeId', 'userId'),
    getField(record, 'staffName', 'employeeName', 'name', 'user.name'),
    getField(record, 'email', 'staffEmail', 'user.email'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Unique employee choices for the admin employee picker, built from records. */
export function getEmployeeOptions(records) {
  const options = new Map();
  const list = Array.isArray(records) ? records : [];

  for (const record of list) {
    const id = getField(record, 'staffId', 'employeeId', 'userId');
    const name = getField(record, 'staffName', 'employeeName', 'name', 'user.name');
    const email = getField(record, 'email', 'staffEmail', 'user.email');
    if (!id && !name && !email) continue;

    const value = String(name || email || id);
    const key = String(email || id || value).toLowerCase();
    if (!options.has(key)) {
      options.set(key, {
        id: String(id || key),
        name: String(name || email || id),
        email: String(email || ''),
        value,
        label: name && email ? `${name} (${email})` : value,
      });
    }
  }

  return [...options.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Apply the same filters client-side as a fallback for APIs that ignore query
 * parameters. Records already filtered by the server pass through unchanged.
 */
export function filterAttendanceRecords(
  records,
  filters = EMPTY_ATTENDANCE_FILTERS
) {
  const requestedDates = filters?.date
    ? {
        ...filters,
        startDate: filters.startDate || filters.date,
        endDate: filters.endDate || filters.date,
      }
    : filters;
  const list = filterRecordsByDate(records, requestedDates);
  const status = filters?.status ?? '';
  const search = String(filters?.search ?? '')
    .trim()
    .toLowerCase();
  const employee = String(filters?.employee ?? '')
    .trim()
    .toLowerCase();

  if (!status && !search && !employee) return list;

  return list.filter((record) => {
    if (status && getRecordStatus(record) !== status) return false;
    if (employee && !getEmployeeSearchText(record).includes(employee)) {
      return false;
    }
    if (!search) return true;

    const searchable = [
      getField(record, 'staffName', 'employeeName', 'name', 'user.name'),
      getField(record, 'email', 'staffEmail', 'user.email'),
      getField(record, 'department', 'team'),
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(search);
  });
}
