
/**
 * ============================================================
 * ATTENDANCE SERVICE - GOOGLE SHEETS INTEGRATION TEST
 * ============================================================
 *
 * PURPOSE:
 * - Test the actual Google Sheets connection.
 * - Retrieve the Users and Events spreadsheet tabs.
 * - Verify that the required column headings exist.
 * - Verify that Firebase UIDs match between both tabs.
 * - Test the actual attendance timestamp service.
 * - Compare returned timestamps against spreadsheet records.
 * - Validate the returned UTC timestamp format.
 *
 * IMPORTANT:
 * These tests use the actual Google spreadsheet.
 * They do not insert, update or delete spreadsheet records.
 *
 * RUN:
 * node --test attendanceService.integration.test.js
 */


// ============================================================
// 1. IMPORT TESTING TOOLS AND ATTENDANCE SERVICE
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";

// Import functions that actually exist in the updated service.
import {
  getAttendanceSheetTables,
  getAttendanceTimestampsFromSheets,
} from "../src/services/attendanceService.js";


// ============================================================
// 2. TEST HELPER FUNCTIONS
// ============================================================

/**
 * Normalise spreadsheet headings.
 *
 * WHY:
 * Spreadsheet headings may contain spaces, brackets and
 * punctuation. Standardising them makes column matching
 * consistent with the attendance service.
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
 * Locate a spreadsheet column by its normalised heading.
 */
function findColumnIndex(headers, expectedName) {

  return headers.findIndex(
    (header) => normaliseTestHeader(header) === expectedName
  );
}


/**
 * Find a spreadsheet tab using its required column headings.
 *
 * WHY:
 * The service should not depend on fixed spreadsheet tab names.
 */
function findSheetByHeaders(sheetTables, requiredHeaders) {

  return sheetTables.find((sheet) => {

    if (!Array.isArray(sheet.values) || sheet.values.length === 0) {
      return false;
    }

    const headers = sheet.values[0].map(normaliseTestHeader);

    return requiredHeaders.every(
      (required) => headers.includes(required)
    );
  });
}


/**
 * Standardise Firebase UIDs for comparison.
 */
function normaliseTestUserId(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


/**
 * Identify recognised clock event types.
 *
 * WHY:
 * The Events spreadsheet contains one Event Type column
 * whose values identify whether the action was a clock-in
 * or a clock-out.
 */
function normaliseTestEvent(value) {

  const event = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (["CLOCKIN", "CHECKIN", "IN"].includes(event)) {
    return "IN";
  }

  if (["CLOCKOUT", "CHECKOUT", "OUT"].includes(event)) {
    return "OUT";
  }

  return null;
}


/**
 * Validate and standardise spreadsheet timestamps.
 *
 * WHY:
 * The test must compare the same UTC timestamp format
 * returned by the attendance service.
 */
function normaliseTestTimestamp(value) {

  if (typeof value !== "string") {
    return null;
  }

  const timestamp = value.trim();

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
// 3. INDEPENDENT TIMESTAMP CALCULATION
// ============================================================

/**
 * Calculate the expected timestamps directly from the
 * retrieved Users and Events spreadsheet records.
 *
 * WHY:
 * The integration test needs an independent calculation
 * to compare against the actual attendance service output.
 *
 * @param {Array} usersValues - Raw Users tab rows.
 * @param {Array} eventsValues - Raw Events tab rows.
 * @returns {Object} Expected employee timestamp information.
 */
function calculateExpectedTimestamps(
  usersValues,
  eventsValues
) {

  // Identify the headings in each spreadsheet.
  const userHeaders = usersValues[0];
  const eventHeaders = eventsValues[0];


  // Locate required Users columns.
  const userIdIndex = findColumnIndex(
    userHeaders,
    "userIdFirebaseUid"
  );

  const employeeIdIndex = findColumnIndex(
    userHeaders,
    "employeeId"
  );

  const nameIndex = findColumnIndex(
    userHeaders,
    "fullName"
  );


  // Locate required Events columns.
  const eventUserIdIndex = findColumnIndex(
    eventHeaders,
    "userId"
  );

  const eventTypeIndex = findColumnIndex(
    eventHeaders,
    "eventTypeClockInClockOut"
  );

  const timestampIndex = findColumnIndex(
    eventHeaders,
    "timestamp"
  );


  // Create a Map to store expected employee timestamps.
  const expected = new Map();


  /**
   * STEP 1:
   * Prepare employee records using their Firebase UIDs.
   */
  for (const row of usersValues.slice(1)) {

    const userId = normaliseTestUserId(
      row[userIdIndex]
    );

    if (!userId) {
      continue;
    }

    const existing = expected.get(userId);

    expected.set(userId, {

      userId,

      employeeId: normaliseTestUserId(
        row[employeeIdIndex]
      ),

      name: String(
        row[nameIndex] ?? existing?.name ?? ""
      ).trim(),

      lastCheckInAt: null,

      lastCheckOutAt: null,

    });
  }


  /**
   * STEP 2:
   * Process clock events and identify their latest timestamps.
   */
  let validEventCount = 0;

  for (const row of eventsValues.slice(1)) {

    const userId = normaliseTestUserId(
      row[eventUserIdIndex]
    );

    const eventType = normaliseTestEvent(
      row[eventTypeIndex]
    );

    const timestamp = normaliseTestTimestamp(
      row[timestampIndex]
    );

    // Reject incomplete or invalid events.
    if (!userId || !eventType || !timestamp) {
      continue;
    }

    // Find the employee associated with this event.
    const employee = expected.get(userId);

    // Ignore events belonging to unknown users.
    if (!employee) {
      continue;
    }

    validEventCount += 1;

    const eventTime = Date.parse(timestamp);


    // Calculate the latest check-in timestamp.
    if (eventType === "IN") {

      const previousTime = employee.lastCheckInAt
        ? Date.parse(employee.lastCheckInAt)
        : -Infinity;

      if (eventTime > previousTime) {
        employee.lastCheckInAt = timestamp;
      }
    }


    // Calculate the latest check-out timestamp.
    else if (eventType === "OUT") {

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
// 4. LIVE GOOGLE SHEETS INTEGRATION TEST
// ============================================================

test(
  "Attendance service - Google Sheets live integration",
  async (t) => {

    /**
     * STEP 1:
     * Retrieve all actual spreadsheet tabs.
     *
     * This calls the Google Sheets API through the
     * attendance service.
     */
    const sheetTables = await getAttendanceSheetTables();


    // Ensure the spreadsheet returned usable tabs.
    assert.ok(
      Array.isArray(sheetTables) && sheetTables.length > 0,
      "Google Sheets returned no spreadsheet tabs."
    );


    /**
     * STEP 2:
     * Identify the Users tab.
     *
     * Required headings:
     * User ID (Firebase UID)
     * Employee ID
     * Full Name
     */
    const usersSheet = findSheetByHeaders(
      sheetTables,
      [
        "userIdFirebaseUid",
        "employeeId",
        "fullName",
      ]
    );


    /**
     * STEP 3:
     * Identify the Events tab.
     *
     * Required headings:
     * Event ID
     * Timestamp
     * User ID
     * Event Type (Clock In/Clock Out)
     *
     * Event Type is ONE column.
     */
    const eventsSheet = findSheetByHeaders(
      sheetTables,
      [
        "eventId",
        "timestamp",
        "userId",
        "eventTypeClockInClockOut",
      ]
    );


    // TEST 1: SPREADSHEET STRUCTURE
    await t.test(
      "Google Sheets contains the Users and Events tabs",
      () => {

        assert.ok(
          usersSheet,
          "Users tab could not be identified. Check its column headings."
        );

        assert.ok(
          eventsSheet,
          "Events tab could not be identified. Check its column headings."
        );

        assert.ok(
          usersSheet.values.length >= 1,
          "Users tab does not contain a heading row."
        );

        assert.ok(
          eventsSheet.values.length >= 1,
          "Events tab does not contain a heading row."
        );

      }
    );


    // Stop further tests if the required tabs cannot be identified.
    if (!usersSheet || !eventsSheet) {
      return;
    }


    // Calculate expected results independently from raw sheet data.
    const expected = calculateExpectedTimestamps(
      usersSheet.values,
      eventsSheet.values
    );


    /**
     * STEP 4:
     * Call the actual attendance service.
     *
     * This performs its own Google authentication,
     * spreadsheet retrieval, matching and timestamp processing.
     */
    const actualResults =
      await getAttendanceTimestampsFromSheets();


    // TEST 2: ACTUAL SERVICE RESPONSE
    await t.test(
      "Attendance service returns employee timestamp records",
      () => {

        assert.ok(
          Array.isArray(actualResults),
          "Service did not return an array."
        );

        // The response should contain every valid user
        // identified in the Users spreadsheet.
        assert.equal(
          actualResults.length,
          expected.employees.length,
          "Returned employee count does not match the Users tab."
        );


        // Validate the structure of each employee record.
        for (const employee of actualResults) {

          assert.ok(
            employee.userId,
            "Employee is missing the Firebase UID."
          );

          assert.ok(
            Object.hasOwn(employee, "lastCheckInAt"),
            "Employee is missing the check-in timestamp field."
          );

          assert.ok(
            Object.hasOwn(employee, "lastCheckOutAt"),
            "Employee is missing the check-out timestamp field."
          );

        }

      }
    );


    // TEST 3: FIREBASE UID MATCHING
    await t.test(
      "Users are matched to Events using Firebase UIDs",
      () => {

        const actualEmployees = new Map(
          actualResults.map((employee) => [
            employee.userId,
            employee,
          ])
        );

        for (const expectedEmployee of expected.employees) {

          const actual = actualEmployees.get(
            expectedEmployee.userId
          );

          assert.ok(
            actual,
            `User ${expectedEmployee.userId} was not returned by the service.`
          );

          assert.equal(
            actual.employeeId,
            expectedEmployee.employeeId,
            "Employee ID does not match the Users tab."
          );

          assert.equal(
            actual.name,
            expectedEmployee.name,
            "Employee name does not match the Users tab."
          );

        }

      }
    );


    // TEST 4: LATEST TIMESTAMP ACCURACY
    await t.test(
      "Latest check-in and check-out timestamps match Google Sheets",
      (t) => {

        // A sheet containing no valid clock events can still
        // be retrieved successfully, but cannot prove timestamp
        // calculation accuracy.
        if (expected.validEventCount === 0) {
          t.skip(
            "No valid clock events are available for timestamp comparison."
          );
          return;
        }

        const actualEmployees = new Map(
          actualResults.map((employee) => [
            employee.userId,
            employee,
          ])
        );


        // Compare the expected and actual timestamps.
        for (const expectedEmployee of expected.employees) {

          const actual = actualEmployees.get(
            expectedEmployee.userId
          );

          assert.equal(
            actual.lastCheckInAt,
            expectedEmployee.lastCheckInAt,
            `Incorrect latest check-in for user ${expectedEmployee.userId}.`
          );

          assert.equal(
            actual.lastCheckOutAt,
            expectedEmployee.lastCheckOutAt,
            `Incorrect latest check-out for user ${expectedEmployee.userId}.`
          );

        }

      }
    );


    // TEST 5: TIMESTAMP FORMAT
    await t.test(
      "Returned timestamps are valid UTC ISO timestamps or null",
      () => {

        for (const employee of actualResults) {

          for (const field of [
            "lastCheckInAt",
            "lastCheckOutAt",
          ]) {

            const timestamp = employee[field];

            // Employees without a recorded action must have null.
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
              `${field} must use UTC timezone formatting.`
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
