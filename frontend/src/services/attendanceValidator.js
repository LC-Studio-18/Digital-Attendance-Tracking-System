const VALID_STATUSES = ['IN', 'OUT'];

function parseDate(value) {
  if (typeof value !== 'string' && !(value instanceof Date)) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validateMeta(meta) {
  const error =
    typeof meta?.error?.message === 'string'
      ? meta.error.message
      : typeof meta?.error === 'string'
        ? meta.error
        : null;

  return {
    refreshStatus:
      typeof meta?.refreshStatus === 'string'
        ? meta.refreshStatus
        : 'pending',
    stale: Boolean(meta?.stale),
    retryAvailable: Boolean(meta?.retryAvailable),
    lastUpdated: parseDate(meta?.lastUpdated),
    lastAttemptAt: parseDate(meta?.lastAttemptAt),
    refreshSuccess:
      typeof meta?.refreshSuccess === 'boolean'
        ? meta.refreshSuccess
        : null,
    error,
  };
}

export function validateAttendance(data) {
  const envelope = data && typeof data === 'object' ? data : null;
  const list = Array.isArray(envelope?.data?.records)
    ? envelope.data.records
    : null;

  if (!list) {
    throw new Error('Attendance data is not in the expected format.');
  }

  const staff = [];
  const seen = new Set();
  let skipped = 0;

  list.forEach((item, index) => {
    const name = typeof item?.name === 'string'
      ? item.name.trim()
      : typeof item?.fullName === 'string'
        ? item.fullName.trim()
        : '';

    if (!name) {
      skipped += 1;
      return;
    }

    const rawStatus = String(item?.status ?? '')
      .trim()
      .toUpperCase();
    const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : 'UNKNOWN';

    const id = String(
      item?.id ?? item?.userId ?? item?.staffId ?? item?.employeeId ??
      `${name}-${index}`,
    ).trim();
    if (seen.has(id)) {
      skipped += 1;
      return;
    }
    seen.add(id);

    const lastClockEvent =
      parseDate(item?.lastClockEvent) ??
      parseDate(item?.lastClockTime) ??
      parseDate(item?.lastEventTime) ??
      parseDate(item?.lastCheckInAt) ??
      parseDate(item?.lastCheckOutAt);
    const lastCheckInAt =
      parseDate(item?.lastCheckInAt) ??
      (status === 'IN' ? lastClockEvent : null);
    const lastCheckOutAt =
      parseDate(item?.lastCheckOutAt) ??
      (status === 'OUT' ? lastClockEvent : null);

    staff.push({
      id,
      name,
      status,
      lastClockEvent,
      lastCheckInAt,
      lastCheckOutAt,
    });
  });

  const backendTotal = envelope.data.totalIn;
  const totalIn =
    Number.isInteger(backendTotal) && backendTotal >= 0
      ? backendTotal
      : staff.filter((s) => s.status === 'IN').length;
  const meta = envelope.meta ? validateMeta(envelope.meta) : validateMeta({});

  return { staff, totalIn, skipped, meta };
}
