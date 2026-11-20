import { getRows } from './googleSheetsService.js';

export async function getEmployeeByUid(uid) {
  if (!uid) return null;

  // Employees: UID, Employee ID, Full Name, Email, Department, Role, Status
  // Attendance: Event ID, Timestamp, User ID, Event Type, Location, Comment
  const [employees, attendance] = await Promise.all([
    getRows('Employees', 'A:G'),
    getRows('Attendance', 'A:F'),
  ]);

  const employee = employees.find((row) => row[0] === uid);
  if (!employee) return null;

  const history = attendance
    .filter((row) => row[2] === uid)
    .map((row) => ({
      timestamp: row[1] || null,
      status: row[3] || 'Present',
    }))
    .filter((entry) => entry.timestamp && /^\d{4}-\d{2}-\d{2}T/.test(entry.timestamp));
  const timestamps = history.map((entry) => entry.timestamp).filter(Boolean);

  return {
    uid,
    name: employee[2] || uid,
    active: !['false', '0', 'inactive', 'no'].includes((employee[6] || 'active').toLowerCase()),
    lastClockIn: timestamps.reduce((latest, timestamp) =>
      !latest || timestamp > latest ? timestamp : latest, null),
    lastClockOut: null,
    history,
  };
}
