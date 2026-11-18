const VALID_STATUSES = ['IN', 'OUT'];

export function validateAttendance(data) {
  const list = Array.isArray(data) ? data : data?.staff;

  if (!Array.isArray(list)) {
    throw new Error('Attendance data is not in the expected format.');
  }

  const staff = [];
  const seen = new Set();
  let skipped = 0;

  list.forEach((item, index) => {
    const name = typeof item?.name === 'string' ? item.name.trim() : '';

    // Can't show someone with no name, so this row is skipped
    if (!name) {
      skipped += 1;
      return;
    }

    // A bad or missing status becomes UNKNOWN instead of hiding the person
    const rawStatus = String(item?.status ?? '')
      .trim()
      .toUpperCase();
    const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : 'UNKNOWN';

    // Skip repeated ids so the same person never shows twice
    const id = item.id ?? `${name}-${index}`;
    if (seen.has(id)) {
      skipped += 1;
      return;
    }
    seen.add(id);

    const rawTime = item.lastClockEvent ?? item.lastEventTime ?? null;
    const time = rawTime ? new Date(rawTime) : null;

    staff.push({
      id,
      name,
      status,
      lastClockEvent: time && !Number.isNaN(time.getTime()) ? time : null,
    });
  });

  // Always count from the validated rows so the total matches the list
  const totalIn = staff.filter((s) => s.status === 'IN').length;

  return { staff, totalIn, skipped };
}
