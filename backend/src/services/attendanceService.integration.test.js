
/**
 * ============================================================
 * ATTENDANCE SERVICE - GOOGLE SHEETS INTEGRATION TEST
 * ============================================================
 *
 * PURPOSE:
 * - Test the actual Google Sheets connection.
 * - Verify that the configured spreadsheet can be retrieved.
 * - Verify that the required spreadsheet columns exist.
 * - Test the attendance service against live spreadsheet data.
 * - Independently calculate the expected latest timestamps.
 * - Compare expected timestamps against the service response.
 * - Check that returned timestamps use valid UTC formatting.
 *
 * IMPORTANT:
 * These are live integration tests.
 * They use the actual Google Sheets connection and records.
 *
 * This test file is READ-ONLY.
 * It does not insert, update or delete spreadsheet records.
 *
 * RUN:
 * node --test src/services/attendanceService.integration.test.js
 */


// ============================================================
// 1. IMPORT TESTING TOOLS AND ATTENDANCE SERVICE
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";

import {
  getAttendanceSheetValues,
  getAttendanceTimestampsFromSheets,
} from "./attendanceService.js";


// ============================================================
// 2. TEST DATA HELPERS
// ============================================================

/**
 * Normalise spreadsheet headings.
 *
 * WHY:
 * The test must locate the required spreadsheet columns
 * without depending on their capitalisation or spacing.
 */
function normaliseTestHeader(header) {

  return String(header ?? "")
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word, index) =>
      index === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
}


/**
 * Find a column using its accepted property names.
 *
 * WHY:
 * This allows the test to confirm that the actual sheet
 * contains the columns required by the attendance service.
 */
function findColumnIndex(headers, acceptedNames) {

  return headers.findIndex((header) =>
    acceptedNames.includes(normaliseTestHeader(header))
  );
}


/**
 * Standardise employee identifiers.
 *
 * WHY:
 * Employee IDs must be compared using the same format
 * when matching spreadsheet records.
 */
function normaliseTestEmployeeId(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


/**
 * Normalise clock event names.
 *
 * WHY:
 * The test must distinguish valid check-in and check-out
 * events when calculating the expected results.
 */
function normaliseTestEvent(value) {

  const event = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (["IN", "CHECKIN", "CLOCKIN"].includes(event)) {
    return "IN";
  }

  if (["OUT", "CHECKOUT", "CLOCKOUT"].includes(event)) {
    return "OUT";
  }

  return null;
}


/**
 * Validate and standardise test timestamps.
 *
 * WHY:
 * The test uses the same timestamp requirements as the
 * attendance service when calculating expected results.
 */
function normaliseTestTimestamp(value) {

  if (typeof value !== "string") {
    return null;
  }

  const timestamp = value.trim();

  // Require an ISO timestamp containing timezone information.
  const isoWithTimezone =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

  if (!isoWithTimezone.test(timestamp)) {
    return null;
  }

  const date = new Date(timestamp);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return date.toISOString();
}


// ============================================================
// 3. INDEPENDENT EXPECTED TIMESTAMP CALCULATION
// ============================================================

/**
 * Calculate the expected timestamps directly from the raw
 * spreadsheet rows.
 *
 * WHY:
 * The test needs an independent result to compare with
 * the attendance service output.
 *
 * This helps identify errors in employee matching,
 * event recognition and latest timestamp selection.
 */
function calculateExpectedTimestamps(values) {

  const headers = values[0];

  // Locate the required spreadsheet columns.
  const employeeIdIndex = findColumnIndex(
    headers,
    ["employeeId", "staffId", "id"]
  );

  const nameIndex = findColumnIndex(
    headers,
    ["name", "fullName"]
  );

  const eventIndex = findColumnIndex(
    headers,
    ["event", "eventType", "clockEvent", "action"]
  );

  const timestampIndex = findColumnIndex(
    headers,
    ["timestamp", "eventTimestamp", "createdAt"]
  );


  // Create a Map to store expected employee records.
  const expected = new Map();


  /**
   * STEP 1:
   * Identify unique employees from the spreadsheet records.
   */
  for (const row of values.slice(1)) {

    const employeeId = normaliseTestEmployeeId(
      row[employeeIdIndex]
    );

    if (!employeeId) {
      continue;
    }

    const existing = expected.get(employeeId);

    expected.set(employeeId, {

      employeeId,

      name: String(
        row[nameIndex] ?? existing?.name ?? ""
      ).trim(),

      lastCheckInAt: null,

      lastCheckOutAt: null,

    });
  }


  /**
   * STEP 2:
   * Independently identify the latest clock timestamps.
   */
  let validEventCount = 0;

  for (const row of values.slice(1)) {

    const employeeId = normaliseTestEmployeeId(
      row[employeeIdIndex]
    );

    const event = normaliseTestEvent(
      row[eventIndex]
    );

    const timestamp = normaliseTestTimestamp(
      row[timestampIndex]
    );

    // Ignore incomplete or invalid clock events.
    if (!employeeId || !event || !timestamp) {
      continue;
    }

    const employee = expected.get(employeeId);

    // Ignore events that do not match an employee record.
    if (!employee) {
      continue;
    }

    validEventCount += 1;

    const eventTime = Date.parse(timestamp);


    // Calculate the latest check-in timestamp.
    if (event === "IN") {

      const previousTime = employee.lastCheckInAt
        ? Date.parse(employee.lastCheckInAt)
        : -Infinity;

      if (eventTime > previousTime) {
        employee.lastCheckInAt = timestamp;
      }
    }


    // Calculate the latest check-out timestamp.
    else if (event === "OUT") {

      const previousTime = employee.lastCheckOutAt
        ? Date.parse(employee.lastCheckOutAt)
        : -Infinity;

      if (eventTime > previousTime) {
        employee.lastCheckOutAt = timestamp;
      }
    }
  }


  return {
    employees: Array.from(expected.values()),
    validEventCount,
  };
}


// ============================================================
// 4. LIVE GOOGLE SHEETS INTEGRATION TESTS
// ============================================================

/**
 * All integration tests run inside this test group.
 *
 * The spreadsheet is retrieved before the individual tests.
 * Each test then uses the same retrieved records.
 */
test(
  "Attendance service - Google Sheets live integration",
  async (t) => {

    /**
     * STEP 1:
     * Retrieve the actual spreadsheet data.
     *
     * This calls the attendance service's Google Sheets
     * retrieval function using the shared .env credentials.
     */
    const sheetValues = await getAttendanceSheetValues();


    // Confirm the Google Sheets API returned usable data.
    assert.ok(
      Array.isArray(sheetValues) && sheetValues.length >= 2,
      "Google Sheets connection succeeded, but the configured range contains no usable header and data rows."
    );


    // Retrieve the spreadsheet column headings.
    const headers = sheetValues[0];

    assert.ok(
      Array.isArray(headers),
      "The spreadsheet header row is invalid."
    );


    /**
     * STEP 2:
     * Verify that all required spreadsheet columns exist.
     */
    const columns = {

      employeeId: findColumnIndex(
        headers,
        ["employeeId", "staffId", "id"]
      ),

      name: findColumnIndex(
        headers,
        ["name", "fullName"]
      ),

      event: findColumnIndex(
        headers,
        ["event", "eventType", "clockEvent", "action"]
      ),

      timestamp: findColumnIndex(
        headers,
        ["timestamp", "eventTimestamp", "createdAt"]
      ),

    };


    const requiredColumnsExist = Object.values(columns).every(
      (index) => index !== -1
    );


    // Test the actual spreadsheet structure.
    await t.test(
      "Google Sheets contains the required employee and event columns",
      () => {

        assert.notEqual(
          columns.employeeId,
          -1,
          "Employee ID column is missing."
        );

        assert.notEqual(
          columns.name,
          -1,
          "Name column is missing."
        );

        assert.notEqual(
          columns.event,
          -1,
          "Event column is missing."
        );

        assert.notEqual(
          columns.timestamp,
          -1,
          "Timestamp column is missing."
        );

      }
    );


    // Do not run timestamp comparisons if the spreadsheet
    // does not contain the required columns.
    if (!requiredColumnsExist) {
      return;
    }


    /**
     * STEP 3:
     * Independently calculate the expected timestamp records.
     */
    const expectedResults = calculateExpectedTimestamps(
      sheetValues
    );


    // Ensure the spreadsheet contains employee records.
    assert.ok(
      expectedResults.employees.length > 0,
      "No usable employee records were found in the spreadsheet."
    );


    // Ensure the spreadsheet contains valid clock events.
    assert.ok(
      expectedResults.validEventCount > 0,
      "No valid clock events were found. Check employee IDs, event types and timestamp formatting."
    );


    /**
     * STEP 4:
     * Call the complete attendance service.
     *
     * This performs another live Google Sheets retrieval
     * and runs the actual timestamp processing logic.
     */
    const actualResults =
      await getAttendanceTimestampsFromSheets();


    // TEST 1: GOOGLE SHEETS RETRIEVAL
    await t.test(
      "Google Sheets successfully returns employee and clock records",
      () => {

        assert.ok(
          Array.isArray(sheetValues),
          "Spreadsheet records were not returned as an array."
        );

        assert.ok(
          sheetValues.length > 1,
          "The configured spreadsheet range contains no employee or clock-event records."
        );

      }
    );


    // TEST 2: ATTENDANCE SERVICE RESPONSE
    await t.test(
      "Attendance service returns valid employee timestamp records",
      () => {

        assert.ok(
          Array.isArray(actualResults),
          "Attendance service did not return an array."
        );

        assert.ok(
          actualResults.length > 0,
          "Attendance service returned no employee timestamp records."
        );


        // Verify the structure of every employee record.
        for (const employee of actualResults) {

          assert.ok(
            employee.employeeId,
            "Employee record is missing its employee ID."
          );

          assert.equal(
            typeof employee.name,
            "string",
            "Employee name must be a string."
          );

          assert.ok(
            Object.hasOwn(employee, "lastCheckInAt"),
            "Employee record is missing lastCheckInAt."
          );

          assert.ok(
            Object.hasOwn(employee, "lastCheckOutAt"),
            "Employee record is missing lastCheckOutAt."
          );

        }

      }
    );


    // TEST 3: EMPLOYEE RECORD MATCHING
    await t.test(
      "Returned employee records match the spreadsheet",
      () => {

        assert.equal(
          actualResults.length,
          expectedResults.employees.length,
          "Returned employee count does not match the spreadsheet."
        );

        const actualEmployees = new Map(
          actualResults.map((employee) => [
            employee.employeeId,
            employee,
          ])
        );


        // Verify that every spreadsheet employee is returned.
        for (const expected of expectedResults.employees) {

          const actual = actualEmployees.get(
            expected.employeeId
          );

          assert.ok(
            actual,
            `Employee ${expected.employeeId} was not returned by the service.`
          );

          assert.equal(
            actual.name,
            expected.name,
            `Employee name does not match for ${expected.employeeId}.`
          );

        }

      }
    );


    // TEST 4: LATEST CHECK-IN AND CHECK-OUT ACCURACY
    await t.test(
      "Latest check-in and check-out timestamps match Google Sheets",
      () => {

        const actualEmployees = new Map(
          actualResults.map((employee) => [
            employee.employeeId,
            employee,
          ])
        );


        // Compare every returned timestamp with the
        // independently calculated expected timestamp.
        for (const expected of expectedResults.employees) {

          const actual = actualEmployees.get(
            expected.employeeId
          );

          assert.equal(
            actual.lastCheckInAt,
            expected.lastCheckInAt,
            `Incorrect latest check-in timestamp for ${expected.employeeId}.`
          );

          assert.equal(
            actual.lastCheckOutAt,
            expected.lastCheckOutAt,
            `Incorrect latest check-out timestamp for ${expected.employeeId}.`
          );

        }

      }
    );


    // TEST 5: TIMESTAMP VALIDATION
    await t.test(
      "Returned timestamps are valid UTC ISO timestamps or null",
      () => {

        for (const employee of actualResults) {

          const timestampFields = [
            "lastCheckInAt",
            "lastCheckOutAt",
          ];

          for (const field of timestampFields) {

            const timestamp = employee[field];

            // Missing clock actions must remain null.
            if (timestamp === null) {
              continue;
            }

            assert.equal(
              typeof timestamp,
              "string",
              `${field} must be a string or null.`
            );

            assert.ok(
              Number.isFinite(Date.parse(timestamp)),
              `${field} contains an invalid date.`
            );

            assert.ok(
              timestamp.endsWith("Z"),
              `${field} must use the UTC timezone.`
            );

            assert.equal(
              new Date(timestamp).toISOString(),
              timestamp,
              `${field} is not in standard ISO format.`
            );

          }

        }

      }
    );

  }
);
