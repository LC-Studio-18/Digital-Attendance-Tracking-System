import { filterRecordsByDate, getField } from './csv.js';

export const EMPTY_ATTENDANCE_FILTERS = Object.freeze({
  startDate: '',
  endDate: '',
  status: '',
  search: '',
});

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
  const raw = getField(record, 'status', 'state') || 'ÔÇö';
  const value = String(raw).toLowerCase();

  if (value.includes('in') && !value.includes('out')) return 'IN';
  if (value.includes('out')) return 'OUT';
  return String(raw).toUpperCase();
}

/**
 * Apply the same filters client-side as a fallback for APIs that ignore query
 * parameters. Records already filtered by the server pass through unchanged.
 */
export function filterAttendanceRecords(
  records,
  filters = EMPTY_ATTENDANCE_FILTERS
) {
  const list = filterRecordsByDate(records, filters);
  const status = filters?.status ?? '';
  const search = String(filters?.search ?? '')
    .trim()
    .toLowerCase();

  if (!status && !search) return list;

  return list.filter((record) => {
    if (status && getRecordStatus(record) !== status) return false;
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
