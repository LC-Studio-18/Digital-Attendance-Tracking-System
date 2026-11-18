
/**
 * ============================================================
 * ONSITE ATTENDANCE SERVICE
 * ============================================================
 *
 * PURPOSE:
 * - Retrieve employee and clock event records from Google Sheets.
 * - Identify active employees.
 * - Match clock events to employees using Firebase UIDs.
 * - Identify each employee's most recent clock action.
 * - Determine whether each employee is currently onsite.
 * - Calculate the total number of employees currently onsite.
 *
 * IMPORTANT:
 * This service reuses the Google Sheets retrieval functionality
 * from attendanceService.js.
 *
 * It does not modify the completed attendance timestamp service.
 *
 * SCOPE:
 * This service ONLY calculates the current onsite employee count.
 */


// ============================================================
// 1. IMPORT EXISTING GOOGLE SHEETS FUNCTIONS
// ============================================================

/**
 * Reuse the existing Google Sheets connection and spreadsheet
 * row conversion functionality.
 *
 * WHY:
 * Google authentication and spreadsheet retrieval have already
 * been implemented in attendanceService.js.
 *
 * Reusing those functions avoids duplicating authentication code.
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
// 3. IDENTIFY THE REQUIRED SPREADSHEET TABS
// ============================================================

/**
 * Find a spreadsheet tab using its required column headings.
 *
 * WHY:
 * The Users and Events tabs may have different names.
 * Identifying them by their structure avoids depending on
 * specific tab names.
 *
 * @param {Array} sheetTables - Retrieved spreadsheet tabs.
 * @param {Array} requiredHeaders - Required column headings.
 * @param {string} description - Tab description.
 * @returns {Object} Matching spreadsheet tab.
 */
function findSheetByHeaders(
  sheetTables,
  requiredHeaders,
  description
) {

  const matchingSheet = sheetTables.find((sheet) => {

    // Ignore tabs without a valid heading row.
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
      "Check that all required column headings are present."
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
 * The Users tab and Events tab both identify employees
 * using their Firebase UID.
 *
 * Consistent IDs ensure clock events are assigned to
 * the correct employee.
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
 * Inactive employees must not contribute to the current
 * onsite workforce count.
 *
 * Only accounts explicitly marked Active are included.
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
 * Convert spreadsheet clock event descriptions into
 * consistent IN or OUT values.
 *
 * WHY:
 * The service needs to distinguish clock-in events from
 * clock-out events when calculating current onsite status.
 *
 * Unrecognised events are rejected.
 */
function normaliseEventType(value) {

  const event = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  // Identify clock-in actions.
  if (["CLOCKIN", "CHECKIN", "IN"].includes(event)) {
    return "IN";
  }

  // Identify clock-out actions.
  if (["CLOCKOUT", "CHECKOUT", "OUT"].includes(event)) {
    return "OUT";
  }

  return null;
}


// ============================================================
// 7. VALIDATE CLOCK EVENT TIMESTAMPS
// ============================================================

/**
 * Validate and standardise timestamps from Google Sheets.
 *
 * Requires ISO 8601 timestamps containing timezone information.
 *
 * WHY:
 * Accurate chronological comparisons are necessary to identify
 * an employee's most recent clock action.
 *
 * Invalid timestamps are rejected so they cannot produce
 * incorrect onsite calculations.
 */
function normaliseTimestamp(value) {

  if (!value) {
    return null;
  }

  // Support JavaScript Date objects.
  if (value instanceof Date) {

    if (!Number.isFinite(value.getTime())) {
      return null;
    }

    return value.toISOString();
  }

  // Only accept string timestamps.
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = value.trim();

  // Require an explicit timezone in the timestamp.
  const validISOFormat =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

  if (!validISOFormat.test(timestamp)) {
    return null;
  }

  // Convert the timestamp into a Date object.
  const date = new Date(timestamp);

  // Reject invalid dates.
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  // Return a consistent UTC timestamp.
  return date.toISOString();
}


// ============================================================
// 8. PREPARE ACTIVE EMPLOYEE RECORDS
// ============================================================

/**
 * Extract active employee records from the Users tab.
 *
 * Required columns:
 * - User ID (Firebase UID)
 * - Employee ID
 * - Full Name
 * - Status (Active/Inactive)
 *
 * WHY:
 * The service needs to know which employees should be included
 * in the onsite calculation.
 *
 * Firebase UID is used as the employee matching identifier.
 *
 * @param {Array} values - Raw Users spreadsheet rows.
 * @returns {Array<Object>} Active employee records.
 */
export function prepareActiveEmployees(values = []) {

  // Convert spreadsheet rows into JavaScript objects.
  const rows = mapSheetRowsToObjects(values);

  // Store employees by their Firebase UID.
  const employees = new Map();

  for (const row of rows) {

    // Retrieve the employee's Firebase UID.
    const userId = normaliseUserId(
      row.userIdFirebaseUid
    );

    // Ignore records without a valid Firebase UID.
    if (!userId) {
      continue;
    }

    // Ignore inactive employees.
    if (!isActiveEmployee(row.statusActiveInactive)) {
      continue;
    }

    // Store the active employee information.
    employees.set(userId, {

      userId,

      employeeId: String(
        row.employeeId ?? ""
      ).trim(),

      name: String(
        row.fullName ?? ""
      ).trim(),

    });
  }

  return Array.from(employees.values());
}


// ============================================================
// 9. PREPARE CLOCK EVENT RECORDS
// ============================================================

/**
 * Extract clock events from the Events tab.
 *
 * Required columns:
 * - Event ID
 * - Timestamp
 * - User ID
 * - Event Type (Clock In/Clock Out)
 *
 * WHY:
 * Clock events provide the information needed to establish
 * whether an employee has entered or left the workplace.
 *
 * @param {Array} values - Raw Events spreadsheet rows.
 * @returns {Array<Object>} Prepared clock event records.
 */
export function prepareClockEvents(values = []) {

  // Convert the spreadsheet rows into JavaScript objects.
  const rows = mapSheetRowsToObjects(values);

  return rows.map((row) => ({

    // Preserve the unique event identifier.
    eventId: row.eventId ?? "",

    // Identify the employee through their Firebase UID.
    userId: normaliseUserId(row.userId),

    // Retrieve the clock action.
    eventType: normaliseEventType(
      row.eventTypeClockInClockOut
    ),

    // Validate the original event timestamp.
    timestamp: normaliseTimestamp(row.timestamp),

  }));
}


// ============================================================
// 10. CALCULATE THE CURRENT ONSITE EMPLOYEE COUNT
// ============================================================

/**
 * MAIN ONSITE CALCULATION FUNCTION
 *
 * Receives active employee records and their clock events.
 *
 * Determines each employee's most recent valid clock action.
 *
 * An employee is counted as onsite when their most recent
 * valid event is a Clock In action.
 *
 * An employee is not counted when their latest event is
 * Clock Out or when they have no valid clock event.
 *
 * WHY:
 * Looking at each employee's latest event prevents someone
 * who previously checked in but subsequently checked out
 * from being incorrectly counted as onsite.
 *
 * @param {Object} data
 * @param {Array} data.staff - Active employee records.
 * @param {Array} data.clockEvents - Clock event records.
 * @returns {number} Total employees currently onsite.
 */
export function calculateCurrentOnsiteCount({

  staff = [],

  clockEvents = [],

} = {}) {

  // Protect the calculation against unexpected data formats.
  const safeStaff = Array.isArray(staff) ? staff : [];

  const safeClockEvents = Array.isArray(clockEvents)
    ? clockEvents
    : [];


  /**
   * STEP 1: REGISTER ACTIVE EMPLOYEES
   *
   * Store each active employee using their Firebase UID.
   *
   * WHY:
   * Only active employees should be considered when
   * calculating the current onsite total.
   */
  const activeEmployees = new Map();

  for (const employee of safeStaff) {

    const userId = normaliseUserId(
      employee.userId
    );

    // Ignore records without a matching identifier.
    if (!userId) {
      continue;
    }

    activeEmployees.set(userId, employee);
  }


  /**
   * STEP 2: IDENTIFY EACH EMPLOYEE'S LATEST CLOCK EVENT
   *
   * Store only the latest valid event for each employee.
   *
   * WHY:
   * The latest event determines whether the employee has
   * most recently entered or left the workplace.
   */
  const latestEvents = new Map();

  for (const event of safeClockEvents) {

    // Retrieve the Firebase UID associated with the event.
    const userId = normaliseUserId(event.userId);

    // Ignore events belonging to inactive or unknown users.
    if (!activeEmployees.has(userId)) {
      continue;
    }

    // Validate the event type.
    const eventType = normaliseEventType(event.eventType);

    // Validate the timestamp.
    const timestamp = normaliseTimestamp(event.timestamp);

    // Ignore invalid clock events.
    if (!eventType || !timestamp) {
      continue;
    }

    // Convert the timestamp into milliseconds for comparison.
    const eventTime = Date.parse(timestamp);

    // Retrieve the previously stored event for this employee.
    const previousEvent = latestEvents.get(userId);


    /**
     * Replace the previous event if the incoming event
     * occurred more recently.
     *
     * This prevents spreadsheet row order from affecting
     * the onsite calculation.
     */
    if (!previousEvent || eventTime > previousEvent.eventTime) {

      latestEvents.set(userId, {

        eventType,

        eventTime,

        // A newer event resolves any previous timestamp tie.
        ambiguous: false,

      });

    }

    /**
     * Handle events with identical timestamps.
     *
     * If opposite clock actions share the exact same timestamp,
     * their order cannot be reliably determined.
     *
     * WHY:
     * The service should not guess whether the employee
     * is currently onsite when event ordering is ambiguous.
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
   * Count only employees whose latest valid event is IN.
   *
   * Employees with a latest OUT event, no valid event,
   * or ambiguous latest events are not counted.
   *
   * WHY:
   * This produces the current onsite employee total
   * instead of counting every historical clock-in.
   */
  let totalOnsite = 0;

  for (const userId of activeEmployees.keys()) {

    const latestEvent = latestEvents.get(userId);

    // Do not count employees who have no valid clock event.
    if (!latestEvent) {
      continue;
    }

    // Ignore events whose latest ordering is ambiguous.
    if (latestEvent.ambiguous) {
      continue;
    }

    // Count employees whose latest action was Clock In.
    if (latestEvent.eventType === "IN") {
      totalOnsite += 1;
    }
  }

  return totalOnsite;
}


// ============================================================
// 11. MAIN GOOGLE SHEETS ONSITE FUNCTION
// ============================================================

/**
 * This is the function called by the backend controller.
 *
 * It:
 * - Retrieves the spreadsheet tabs.
 * - Identifies the Users tab.
 * - Identifies the Events tab.
 * - Prepares active employee records.
 * - Prepares clock event records.
 * - Calculates the number of employees currently onsite.
 *
 * WHY:
 * This function connects Google Sheets retrieval with
 * the onsite employee calculation.
 *
 * @returns {Promise<number>} Total employees currently onsite.
 */
export async function getCurrentOnsiteCountFromSheets() {

  try {

    // Retrieve all tabs from the configured Google spreadsheet.
    const sheetTables = await getAttendanceSheetTables();


    /**
     * STEP 1: IDENTIFY THE USERS TAB
     *
     * Locate the employee information using its column headings.
     */
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


    /**
     * STEP 2: IDENTIFY THE EVENTS TAB
     *
     * Event Type is one column containing Clock In or Clock Out.
     */
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


    // STEP 3: Prepare active employees.
    const activeEmployees = prepareActiveEmployees(
      usersSheet.values
    );


    // STEP 4: Prepare clock events.
    const clockEvents = prepareClockEvents(
      eventsSheet.values
    );


    // STEP 5: Calculate and return the current onsite total.
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

    // Pass the error to the backend controller.
    throw new Error(
      `Unable to calculate current onsite employees: ${error.message}`,
      { cause: error }
    );
  }
}
