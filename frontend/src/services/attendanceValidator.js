const VALID_STATUSES = new Set(['IN', 'OUT']);

function parseDate(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validateLiveAttendance(payload) {
  const sourceRecords = payload?.data?.records;
  if (!Array.isArray(sourceRecords)) {
    throw new Error('Attendance data is not in the expected format.');
  }

  const seenIds = new Set();
  let skipped = 0;
  const records = sourceRecords.flatMap((record, index) => {
    const name =
      typeof record?.name === 'string'
        ? record.name.trim()
        : typeof record?.fullName === 'string'
          ? record.fullName.trim()
          : '';

    if (!name) {
      skipped += 1;
      return [];
    }

    const id = String(
      record.userId ??
        record.staffId ??
        record.id ??
        record.employeeId ??
        `${name}-${index}`
    ).trim();
    if (!id || seenIds.has(id)) {
      skipped += 1;
      return [];
    }
    seenIds.add(id);

    const rawStatus = String(record.status ?? '')
      .trim()
      .toUpperCase();
    const status = VALID_STATUSES.has(rawStatus) ? rawStatus : 'UNKNOWN';

    return [
      {
        id,
        name,
        employeeId: String(record.employeeId ?? record.staffId ?? id),
        department:
          typeof record.department === 'string' ? record.department : '',
        status,
        lastClockTime:
          parseDate(record.lastClockTime) ??
          parseDate(record.lastClockEvent) ??
          parseDate(record.lastCheckInAt) ??
          parseDate(record.lastCheckOutAt),
        lastCheckInAt: parseDate(record.lastCheckInAt),
        lastCheckOutAt: parseDate(record.lastCheckOutAt),
      },
    ];
  });

  const backendTotal = payload.data.totalIn;
  const totalIn =
    Number.isInteger(backendTotal) && backendTotal >= 0
      ? backendTotal
      : records.filter((record) => record.status === 'IN').length;
  const lastUpdated = parseDate(payload?.meta?.lastUpdated);

  return { records, totalIn, lastUpdated, skipped };
}
