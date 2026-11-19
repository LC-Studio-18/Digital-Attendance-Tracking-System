import { getRows } from './googleSheetsService.js';

export async function getEmployeeByUid(uid) {
  if (!uid) return null;

  // Employees columns: uid, name, active. Attendance rows: uid, timestamp.
  const [employees, attendance] = await Promise.all([
    getRows('Employees', 'A:C'),
    getRows('Attendance', 'A:B'),
  ]);

  const employee = employees.find((row) => row[0] === uid);
  if (!employee) return null;

  const history = attendance
    .filter((row) => row[0] === uid)
    .map((row) => ({ timestamp: row[1] || null, status: 'Present' }));
  const timestamps = history.map((entry) => entry.timestamp).filter(Boolean);

  return {
    uid,
    name: employee[1] || uid,
    active: !['false', '0', 'inactive', 'no'].includes((employee[2] || 'true').toLowerCase()),
    lastClockIn: timestamps.reduce((latest, timestamp) =>
      !latest || timestamp > latest ? timestamp : latest, null),
    lastClockOut: null,
    history,
  };
}
