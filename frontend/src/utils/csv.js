/** Shared helpers for the client-side attendance CSV export. */

const DEFAULT_DATE_FIELDS = [
  'date',
  'createdAt',
  'timestamp',
  'clockIn',
  'checkIn',
  'inTime',
];

/** Read the first value that is present from a list of possible field names. */
export function getField(record, ...keys) {
  for (const key of keys) {
    const value = key
      .split('.')
      .reduce((current, part) => current?.[part], record);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '';
}

/**
 * Normalise a value to a local YYYY-MM-DD key so date strings and Date objects
 * compare consistently. A leading ISO date is used as-is to avoid an unwanted
 * day shift when the browser is in a different timezone.
 */
export function toDateKey(value) {
  if (value === undefined || value === null || value === '') return '';

  if (typeof value === 'string') {
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (isoDate) return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Return records whose (first available) date falls inside the inclusive
 * start/end range. With no range the original array is returned unchanged.
 */
export function filterRecordsByDate(
  records,
  { startDate = '', endDate = '' } = {},
  dateFields = DEFAULT_DATE_FIELDS
) {
  const list = Array.isArray(records) ? records : [];
  if (!startDate && !endDate) return list;

  return list.filter((record) => {
    const key = toDateKey(getField(record, ...dateFields));
    if (!key) return false;
    return (!startDate || key >= startDate) && (!endDate || key <= endDate);
  });
}

/** Quote a value only when CSV syntax requires it. */
export function escapeCsvValue(value) {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Build a CRLF-delimited CSV string with a header row. */
export function buildCsv(records, columns) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const header = safeColumns.map((column) => escapeCsvValue(column.label));
  const rows = (Array.isArray(records) ? records : []).map((record) =>
    safeColumns.map((column) =>
      escapeCsvValue(
        column.getValue ? column.getValue(record) : getField(record, column.key)
      )
    )
  );

  const lines = [header.join(','), ...rows.map((row) => row.join(','))];
  return lines.join('\r\n') + '\r\n';
}

/** Save CSV content as a browser download. */
export function downloadCsv(content, filename = 'attendance-export') {
  const blob = new Blob(['\uFEFF', content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = String(filename).endsWith('.csv')
    ? String(filename)
    : `${filename}.csv`;

  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
