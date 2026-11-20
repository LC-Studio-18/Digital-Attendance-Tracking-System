
import { getRows } from './sheets.js';

export async function getEmployeeByUid(uid) {
  if (!uid) return null;

  const employees = await getRows('Employees', 'A:G');

  const employee = employees.find((row) => row[0]?.trim() === uid.trim());

  if (!employee) return null;

  return {
    uid: employee[0],
    employeeId: employee[1] || null,
    name: employee[2] || null,
    email: employee[3] || null,
    department: employee[4] || null,
    role: employee[5] || null,
    active: !['false', '0', 'inactive', 'no'].includes(
      (employee[6] || 'active').toLowerCase().trim()
    ),
  };
}
