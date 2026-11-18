const VALID_STATUSES = ['IN', 'OUT'];

export function validateAttendance(data) {
  const list = Array.isArray(data) ? data : data?.staff;

  if (!Array.isArray(list)) {
    throw new Error('Attendance data is not in the expected format.');
  }

  const staff = [];
  let skipped = 0;

  list.forEach((item, index) => {
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    const status = String(item?.status ?? '')
      .trim()
      .toUpperCase();

    if (!name || !VALID_STATUSES.includes(status)) {
      skipped += 1; // this is the broke record, it doesnt rennder
      return;
    }

    const rawTime = item.lastClockEvent ?? item.lastEventTime ?? null;
    const time = rawTime ? new Date(rawTime) : null;

    staff.push({
      id: item.id ?? `${name}-${index}`,
      name,
      status,
      lastClockEvent: time && !Number.isNaN(time.getTime()) ? time : null,
    });
  });

  const totalIn = Number.isInteger(data?.totalIn)
    ? data.totalIn
    : staff.filter((s) => s.status === 'IN').length;

  return { staff, totalIn, skipped };
}
