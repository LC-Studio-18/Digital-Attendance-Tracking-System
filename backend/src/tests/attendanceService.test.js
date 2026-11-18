
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { clockOutEmployee } from '../services/attendanceService.js';
import {
  employees,
  attendanceEvents,
} from '../data/attendanceData.js';

describe('Clock-out service', () => {

  // Test 1: An employee who has clocked in should be able to clock out.
  it('should successfully clock out an employee who is IN', () => {
    const result = clockOutEmployee('demo-firebase-uid-001');

    assert.equal(result.status, 'OUT');
    assert.equal(result.employeeId, 'EMP001');
    assert.ok(Date.parse(result.timestamp));

    const latestEvent = attendanceEvents.at(-1);

    assert.equal(latestEvent.event, 'OUT');
    assert.equal(latestEvent.firebaseUid, 'demo-firebase-uid-001');
  });

  // Test 2: An employee should not be able to clock out twice.
  it('should prevent an employee from clocking out twice', () => {
    assert.throws(
      () => clockOutEmployee('demo-firebase-uid-001'),
      (error) => error.status === 409
    );
  });

  // Test 3: An inactive employee should not be allowed to clock out.
  it('should reject an inactive employee', () => {
    const employee = employees.find(
      (employee) => employee.firebaseUid === 'demo-firebase-uid-001'
    );

    employee.isActive = false;

    try {
      assert.throws(
        () => clockOutEmployee('demo-firebase-uid-001'),
        (error) => error.status === 403
      );
    } finally {
      // Restore the employee's active status after the test.
      employee.isActive = true;
    }
  });

  // Test 4: An employee who has never clocked in cannot clock out.
  it('should reject an employee who has not clocked in', () => {

    // Add a temporary employee with a unique ID and Firebase UID.
    // This employee has no attendance events.
    employees.push({
      employeeId: 'EMP999',
      firebaseUid: 'demo-firebase-uid-999',
      name: 'Employee Without Clock-In',
      isActive: true,
    });

    try {
      // Attempt to clock out the employee.
      // The service should return an error with status 409.
      assert.throws(
        () => clockOutEmployee('demo-firebase-uid-999'),
        (error) => error.status === 409
      );
    } finally {
      // Remove the temporary employee after the test.
      employees.pop();
    }
  });

});
