
// Temporary employee records used by the clock-out feature.
// Each employee is identified using their employee ID and Firebase UID.
const employees = [
  {
    employeeId: 'EMP001',
    firebaseUid: 'demo-firebase-uid-001',
    name: 'Demo Employee',
    isActive: true,
  },

  {
    employeeId: 'EMP002',
    firebaseUid: 'demo-firebase-uid-002',
    name: 'Test Employee 2',
    isActive: true,
  },
];

// Initial attendance events used to simulate employees
// who have already clocked in.
const attendanceEvents = [
  {
    employeeId: 'EMP001',
    firebaseUid: 'demo-firebase-uid-001',
    event: 'IN',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },

  {
    employeeId: 'EMP002',
    firebaseUid: 'demo-firebase-uid-002',
    event: 'IN',
    timestamp: new Date().toISOString(),
  },
];

// Export the arrays so the attendance service and tests can access them.
export { employees, attendanceEvents };
