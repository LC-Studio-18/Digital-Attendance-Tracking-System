
/**
 * ============================================================
 * ATTENDANCE DATA DIAGNOSTIC
 * ============================================================
 *
 * PURPOSE:
 * Inspect the actual data returned by Google Sheets without
 * displaying employee names, Firebase UIDs or personal details.
 *
 * WHY:
 * The controller currently rejects all retrieved records.
 * This diagnostic helps identify which required fields are
 * missing or invalid before changing the controller.
 */

import "dotenv/config";

import {
  getLiveAttendanceData,
} from "./src/services/attendanceDataprovider.js";

// Checks whether a timestamp is valid and not in the future.
function isValidTimestamp(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getTime() <= Date.now()
  );
}

// Checks whether the supplied status is recognised by
// the attendance controller.
function hasValidStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toUpperCase();

  return [
    "IN",
    "CLOCK IN",
    "OUT",
    "CLOCK OUT",
    "UNKNOWN",
  ].includes(status);
}

async function inspectAttendanceData() {
  try {
    // Retrieve the actual information from the Sheets provider.
    const result = await getLiveAttendanceData();

    const records = result.records;

    console.log("\n===== ATTENDANCE DATA DIAGNOSTIC =====");

    console.log("Total records retrieved:", records.length);
    console.log("Onsite total returned:", result.totalIn);

    if (records.length === 0) {
      console.log("The provider returned an empty record list.");
      return;
    }

    // Display field names only, not employee information.
    console.log(
      "\nFirst record field names:",
      Object.keys(records[0])
    );

    // Count records that contain the required employee identifier.
    const validIdentifiers = records.filter(
      (row) =>
        String(row.userId ?? row.staffId ?? "").trim()
    ).length;

    // Count records with an employee name.
    const validNames = records.filter(
      (row) =>
        String(row.name ?? row.fullName ?? "").trim()
    ).length;

    // Count records with valid check-in timestamps.
    const validCheckIns = records.filter(
      (row) => isValidTimestamp(row.lastCheckInAt)
    ).length;

    // Count records with valid check-out timestamps.
    const validCheckOuts = records.filter(
      (row) => isValidTimestamp(row.lastCheckOutAt)
    ).length;

    // Count records with a valid general timestamp.
    const validGeneralTimestamps = records.filter(
      (row) =>
        isValidTimestamp(row.lastClockTime) ||
        isValidTimestamp(row.timestamp)
    ).length;

    // Count records with an explicitly recognised status.
    const validStatuses = records.filter(
      (row) =>
        hasValidStatus(row.status) ||
        hasValidStatus(row.eventType)
    ).length;

    // Determine which records have at least one usable timestamp.
    const recordsWithTimestamps = records.filter(
      (row) =>
        isValidTimestamp(row.lastCheckInAt) ||
        isValidTimestamp(row.lastCheckOutAt) ||
        isValidTimestamp(row.lastClockTime) ||
        isValidTimestamp(row.timestamp)
    ).length;

    // A record can have its status derived from check-in/out
    // timestamps even when it has no explicit status property.
    const recordsWithDerivableStatus = records.filter(
      (row) =>
        isValidTimestamp(row.lastCheckInAt) ||
        isValidTimestamp(row.lastCheckOutAt)
    ).length;

    console.log("\n===== FIELD VALIDATION COUNTS =====");

    console.log(
      "Records with employee identifier:",
      validIdentifiers
    );

    console.log(
      "Records with employee name:",
      validNames
    );

    console.log(
      "Records with valid check-in timestamp:",
      validCheckIns
    );

    console.log(
      "Records with valid check-out timestamp:",
      validCheckOuts
    );

    console.log(
      "Records with valid general timestamp:",
      validGeneralTimestamps
    );

    console.log(
      "Records with at least one valid timestamp:",
      recordsWithTimestamps
    );

    console.log(
      "Records with explicit valid status:",
      validStatuses
    );

    console.log(
      "Records with a derivable status:",
      recordsWithDerivableStatus
    );

    console.log("\n===== END DIAGNOSTIC =====\n");

  } catch (error) {
    console.error(
      "\nDIAGNOSTIC FAILED:",
      error.message
    );

    if (error.code) {
      console.error("Error code:", error.code);
    }
  }
}

inspectAttendanceData();

