
import { employees, attendanceEvents } from '../data/attendanceData.js';

// Clock out an employee using their Firebase UID.
export function clockOutEmployee(firebaseUid) {

  // STEP 1: Find the employee using their Firebase UID.
  const employee = employees.find(
    (employee) => employee.firebaseUid === firebaseUid
  );

  // STEP 2: Check whether the employee exists.
  // Return a 404 error if no matching employee is found.
  if (!employee) {
    const error = new Error('Employee not found.');
    error.status = 404;
    throw error;
  }

  // STEP 3: Check whether the employee's account is active.
  // Inactive employees are not allowed to clock out.
  if (!employee.isActive) {
    const error = new Error('Employee account is inactive.');
    error.status = 403;
    throw error;
  }

  // STEP 4: Retrieve all attendance events belonging to this employee.
  // Sort them from newest to oldest using their timestamps.
  const employeeEvents = attendanceEvents
    .filter((event) => event.employeeId === employee.employeeId)
    .sort(
      (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
    );

  // Get the employee's most recent attendance event.
  const latestEvent = employeeEvents[0];

  // STEP 5: Confirm that the employee is currently clocked in.
  // Reject the request if there is no previous event or the latest event is not IN.
  if (!latestEvent || latestEvent.event !== 'IN') {
    const error = new Error('You are not currently clocked in.');
    error.status = 409;
    throw error;
  }

  // STEP 6: Generate the clock-out timestamp using the server's current time.
  const timestamp = new Date().toISOString();

  // STEP 7: Create a new attendance event with an OUT status.
  const clockOutEvent = {
    employeeId: employee.employeeId,
    firebaseUid: employee.firebaseUid,
    event: 'OUT',
    timestamp,
  };

  // Save the new event to the attendance events array.
  // Note: This is currently in-memory demo storage.
  attendanceEvents.push(clockOutEvent);

  // STEP 8: Return the employee's updated attendance information.
  return {
    employeeId: employee.employeeId,
    firebaseUid: employee.firebaseUid,
    name: employee.name,
    status: 'OUT',
    timestamp,
  };
}
