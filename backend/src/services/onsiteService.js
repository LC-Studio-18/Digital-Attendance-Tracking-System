
/**
 * ============================================================
 * ONSITE ATTENDANCE SERVICE
 * ============================================================
 *
 * PURPOSE:
 * - Retrieve Users and Events records from Google Sheets.
 * - Identify active employees.
 * - Match clock events using Firebase UIDs.
 * - Identify each employee's latest valid clock event.
 * - Calculate the number of employees currently onsite.
 * - Prevent duplicate employees from being counted.
 * - Reject invalid and future-dated clock events.
 * - Return zero when no employees are currently onsite.
 *
 * IMPORTANT:
 * This service reuses the existing Google Sheets connection
 * from attendanceService.js.
 *
 * The completed attendance timestamp service is not modified.
 *
 * SCOPE:
 * This service only calculates the current onsite employee total.
 */


/**
 * ============================================================
 * 1. IMPORT GOOGLE SHEETS FUNCTIONS
 * ============================================================
 *
 * Reuse the existing Google Sheets retrieval and row conversion
 * functions from attendanceService.js.
 *
 * WHY:
 * Google authentication and spreadsheet retrieval have
 * already been implemented.
 *
 * Reusing these functions avoids duplicating authentication
 * logic and keeps the services consistent.
 */
import {
  getAttendanceSheetTables,
  mapSheetRowsToObjects,
} from "./attendanceService.js";


// ============================================================
// 2. NORMALISE SPREADSHEET HEADERS
// ============================================================

/**
 * Convert spreadsheet headings into consistent JavaScript keys.
 *
 * WHY:
 * This allows the service to identify the Users and Events tabs
 * using their column headings rather than their tab names.
 */
function normaliseHeader(header) {

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


// ============================================================
// 3. IDENTIFY USERS AND EVENTS SPREADSHEET TABS
// ============================================================

/**
 * Locate a spreadsheet tab using its required column headings.
 *
 * WHY:
 * The service should not depend on fixed spreadsheet tab names.
 * It identifies the correct tabs using their actual structures.
 *
 * @param {Array} sheetTables - Retrieved spreadsheet tabs.
 * @param {Array} requiredHeaders - Required column names.
 * @param {string} description - Tab description.
 * @returns {Object} Matching spreadsheet tab.
 */
function findSheetByHeaders(
  sheetTables,
  requiredHeaders,
  description
) {

  const matchingSheet = sheetTables.find((sheet) => {

    // Ignore tabs without a valid header row.
    if (!Array.isArray(sheet.values) || sheet.values.length === 0) {
      return false;
    }

    // Normalise the spreadsheet headings.
    const headers = sheet.values[0].map(normaliseHeader);

    // Confirm that every required column exists.
    return requiredHeaders.every((requiredHeader) =>
      headers.includes(requiredHeader)
    );
  });

  // Report a clear error if the required tab cannot be identified.
  if (!matchingSheet) {
    throw new Error(
      `Unable to identify the ${description} spreadsheet tab. ` +
      "Check that its required column headings are present."
    );
  }

  return matchingSheet;
}


// ============================================================
// 4. NORMALISE FIREBASE USER IDS
// ============================================================

/**
 * Standardise Firebase UIDs before matching spreadsheet records.
 *
 * WHY:
 * Both the Users and Events tabs use Firebase UIDs.
 * Consistent identifiers ensure clock events are matched
 * to the correct employee.
 */
function normaliseUserId(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


// ============================================================
// 5. CHECK EMPLOYEE ACCOUNT STATUS
// ============================================================

/**
 * Determine whether an employee account is active.
 *
 * WHY:
 * Only active employees should be included in the current
 * onsite workforce calculation.
 *
 * Accounts without an explicitly active status are excluded.
 */
function isActiveEmployee(value) {

  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  return status === "active";
}


// ============================================================
// 6. NORMALISE CLOCK EVENT TYPES
// ============================================================

/**
 * Convert clock event descriptions into consistent IN or OUT values.
 *
 * WHY:
 * The service must distinguish clock-in actions from
 * clock-out actions when calculating onsite attendance.
 *
 * Unrecognised event types are rejected.
 */
function normaliseEventType(value) {

  const event = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  // Identify recognised clock-in actions.
  if (["CLOCKIN", "CHECKIN", "IN"].includes(event)) {
    return "IN";
  }

  // Identify recognised clock-out actions.
  if (["CLOCKOUT", "CHECKOUT", "OUT"].includes(event)) {
    return "OUT";
  }

  return null;
}


// ============================================================
// 7. VALIDATE CLOCK EVENT TIMESTAMPS
// ============================================================

/**
 * Validate incoming clock event timestamps.
 *
 * Requires ISO 8601 timestamps containing explicit timezone data.
 *
 * WHY:
 * Accurate chronological comparisons are required to identify
 * the latest clock action for each employee.
 *
 * Future timestamps are rejected so that clock events which
 * have not yet occurred cannot influence the onsite total.
 *
 * @param {string|Date} value - Incoming timestamp.
 * @param {number} nowMs - Current backend time in milliseconds.
 * @returns {string|null} Valid UTC timestamp or null.
 */
function normaliseTimestamp(value, nowMs = Date.now()) {

  // Reject missing timestamp values.
  if (!value) {
    return null;
  }

  let date;

  // Support valid JavaScript Date objects.
  if (value instanceof Date) {

    date = value;

  } else {

    // Only accept string timestamps from the spreadsheet.
    if (typeof value !== "string") {
      return null;
    }

    const timestamp = value.trim();

    // Require ISO 8601 format with explicit timezone information.
    const validISOFormat =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

    if (!validISOFormat.test(timestamp)) {
      return null;
    }

    // Convert the incoming timestamp into a Date object.
    date = new Date(timestamp);
  }

  // Reject timestamps JavaScript cannot interpret.
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  // Reject clock events that are later than backend time.
  if (date.getTime() > nowMs) {
    return null;
  }

  // Return the timestamp in standard UTC format.
  return date.toISOString();
}


// ============================================================
// 8. PREPARE ACTIVE EMPLOYEE RECORDS
// ============================================================

/**
 * Extract active employees from the Users spreadsheet tab.
 *
 * REQUIRED COLUMNS:
 * - User ID (Firebase UID)
 * - Employee ID
 * - Full Name
 * - Status (Active/Inactive)
 *
 * WHY:
 * The service must identify which employees are eligible
 * to contribute to the onsite total.
 *
 * Firebase UIDs are used as unique identifiers to prevent
 * duplicate employees from being counted.
 *
 * @param {Array} values - Raw Users spreadsheet rows.
 * @returns {Array<Object>} Unique active employee records.
 */
export function prepareActiveEmployees(values = []) {

  // Convert spreadsheet rows into JavaScript objects.
  const rows = mapSheetRowsToObjects(values);

  // Store active employees using their Firebase UIDs.
  const employees = new Map();

  for (const row of rows) {

    // Retrieve the employee's Firebase UID.
    const userId = normaliseUserId(
      row.userIdFirebaseUid ??
      row.firebaseUid ??
      row.userId ??
      row.uid
    );

    // Reject records without valid Firebase UIDs.
    if (!userId) {
      continue;
    }

    // Only employees explicitly marked Active are included.
    if (!isActiveEmployee(row.statusActiveInactive)) {
      continue;
    }

    // Store the employee using their unique Firebase UID.
    // Map prevents duplicate employee records from being counted.
    employees.set(userId, {

      userId,

      employeeId: String(
        row.employeeId ?? ""
      ).trim(),

      name: String(
        row.fullName ?? row.name ?? ""
      ).trim(),

    });
  }

  return Array.from(employees.values());
}


// ============================================================
// 9. PREPARE CLOCK EVENT RECORDS
// ============================================================

/**
 * Extract clock events from the Events spreadsheet tab.
 *
 * REQUIRED COLUMNS:
 * - Event ID
 * - Timestamp
 * - User ID
 * - Event Type (Clock In/Clock Out)
 *
 * WHY:
 * Clock events determine whether an employee has most recently
 * entered or left the workplace.
 *
 * Location and Comment are not required for this calculation.
 *
 * @param {Array} values - Raw Events spreadsheet rows.
 * @returns {Array<Object>} Prepared clock event records.
 */
export function prepareClockEvents(values = []) {

  // Convert spreadsheet rows into JavaScript objects.
  const rows = mapSheetRowsToObjects(values);

  return rows.map((row) => ({

    // Preserve the unique clock event identifier.
    eventId: row.eventId ?? "",

    // Identify the employee using their Firebase UID.
    userId: normaliseUserId(row.userId),

    // Retrieve the clock action type.
    eventType: row.eventTypeClockInClockOut ?? "",

    // Retrieve the original event timestamp.
    timestamp: row.timestamp ?? "",

  }));
}


// ============================================================
// 10. CALCULATE THE CURRENT ONSITE EMPLOYEE COUNT
// ============================================================

/**
 * MAIN ONSITE CALCULATION FUNCTION
 *
 * Receives active employees and their clock event records.
 *
 * An employee is counted as onsite when their latest valid
 * clock event is Clock In.
 *
 * An employee is excluded when:
 * - Their latest valid event is Clock Out.
 * - They have no valid clock events.
 * - Their latest clock event is ambiguous.
 * - Their employee account is inactive or unknown.
 *
 * WHY:
 * Counting the latest clock action instead of historical
 * clock-in rows prevents employees from being counted
 * multiple times.
 *
 * @param {Object} data
 * @param {Array} data.staff - Active employee records.
 * @param {Array} data.clockEvents - Clock event records.
 * @returns {number} Current onsite employee total.
 */
export function calculateCurrentOnsiteCount({

  staff = [],

  clockEvents = [],

} = {}) {

  // Protect the function against unexpected data formats.
  const safeStaff = Array.isArray(staff) ? staff : [];

  const safeClockEvents = Array.isArray(clockEvents)
    ? clockEvents
    : [];

  // Capture backend time once for consistent validation.
  const nowMs = Date.now();


  /**
   * STEP 1: REGISTER ACTIVE EMPLOYEES
   *
   * Store each active employee using their Firebase UID.
   *
   * WHY:
   * Only active employees should be counted.
   * Using a Map prevents duplicate user records.
   */
  const activeEmployees = new Map();

  for (const employee of safeStaff) {

    const userId = normaliseUserId(employee.userId);

    // Ignore employees without a valid identifier.
    if (!userId) {
      continue;
    }

    // Store each unique active employee once.
    activeEmployees.set(userId, employee);
  }


  /**
   * STEP 2: IDENTIFY EACH EMPLOYEE'S LATEST CLOCK EVENT
   *
   * Process valid events and retain the latest event per user.
   *
   * WHY:
   * The latest event determines whether an employee is
   * currently onsite or has already clocked out.
   *
   * Spreadsheet row order is not used to determine recency.
   */
  const latestEvents = new Map();

  for (const event of safeClockEvents) {

    // Retrieve the Firebase UID associated with this event.
    const userId = normaliseUserId(event.userId);

    // Ignore unknown and inactive users.
    if (!activeEmployees.has(userId)) {
      continue;
    }

    // Validate and standardise the clock event type.
    const eventType = normaliseEventType(event.eventType);

    // Validate the timestamp and reject future events.
    const timestamp = normaliseTimestamp(
      event.timestamp,
      nowMs
    );

    // Ignore events containing invalid information.
    if (!eventType || !timestamp) {
      continue;
    }

    // Convert the timestamp into milliseconds for comparison.
    const eventTime = Date.parse(timestamp);

    // Retrieve the previously stored latest event.
    const previousEvent = latestEvents.get(userId);


    /**
     * UPDATE THE LATEST EVENT
     *
     * Replace the previous record when the incoming event
     * has a newer timestamp.
     */
    if (!previousEvent || eventTime > previousEvent.eventTime) {

      latestEvents.set(userId, {

        eventType,

        eventTime,

        // A newer timestamp resolves any previous ambiguity.
        ambiguous: false,

      });
    }


    /**
     * HANDLE IDENTICAL TIMESTAMPS
     *
     * Opposite clock actions with the exact same timestamp
     * cannot be reliably ordered.
     *
     * WHY:
     * The service must not guess whether the employee is onsite.
     */
    else if (
      eventTime === previousEvent.eventTime &&
      eventType !== previousEvent.eventType
    ) {

      previousEvent.ambiguous = true;
    }
  }


  /**
   * STEP 3: COUNT EMPLOYEES CURRENTLY ONSITE
   *
   * Count each active employee only once when their latest
   * valid and unambiguous clock event is Clock In.
   *
   * WHY:
   * The dashboard needs the number of unique employees
   * currently onsite, not the total number of clock-in rows.
   */
  let totalOnsite = 0;

  for (const userId of activeEmployees.keys()) {

    const latestEvent = latestEvents.get(userId);

    // Ignore employees without a valid clock event.
    if (!latestEvent) {
      continue;
    }

    // Ignore employees with conflicting latest events.
    if (latestEvent.ambiguous) {
      continue;
    }

    // Count employees whose latest event was Clock In.
    if (latestEvent.eventType === "IN") {
      totalOnsite += 1;
    }
  }

  // Return zero automatically when nobody is onsite.
  return totalOnsite;
}


// ============================================================
// 11. MAIN GOOGLE SHEETS ONSITE FUNCTION
// ============================================================

/**
 * Main function called by the backend controller.
 *
 * Performs the complete process:
 * - Retrieves fresh Google Sheets records.
 * - Identifies the Users tab.
 * - Identifies the Events tab.
 * - Prepares active employee records.
 * - Prepares clock events.
 * - Calculates the current onsite employee total.
 *
 * WHY:
 * This connects the spreadsheet data to the onsite calculation.
 *
 * IMPORTANT:
 * No cached total is used. Every invocation retrieves
 * fresh spreadsheet data.
 *
 * @returns {Promise<number>} Current onsite employee total.
 */
export async function getCurrentOnsiteCountFromSheets() {

  try {

    // STEP 1: Retrieve the available spreadsheet tabs.
    const sheetTables = await getAttendanceSheetTables();


    // STEP 2: Identify the Users tab by its column headings.
    const usersSheet = findSheetByHeaders(

      sheetTables,

      [
        "userIdFirebaseUid",
        "employeeId",
        "fullName",
        "statusActiveInactive",
      ],

      "Users"

    );


    // STEP 3: Identify the Events tab by its column headings.
    const eventsSheet = findSheetByHeaders(

      sheetTables,

      [
        "eventId",
        "timestamp",
        "userId",
        "eventTypeClockInClockOut",
      ],

      "Events"

    );


    // STEP 4: Prepare the active employee records.
    const activeEmployees = prepareActiveEmployees(
      usersSheet.values
    );


    // STEP 5: Prepare clock event records.
    const clockEvents = prepareClockEvents(
      eventsSheet.values
    );


    // STEP 6: Calculate and return the current onsite total.
    return calculateCurrentOnsiteCount({

      staff: activeEmployees,

      clockEvents,

    });

  } catch (error) {

    // Record failures for backend debugging.
    console.error(
      "Onsite calculation service failed:",
      error.message
    );

    // Pass the error to the calling controller.
    throw new Error(
      `Unable to calculate current onsite employees: ${error.message}`,
      { cause: error }
    );
  }
}
