
/**
 * ============================================================
 * ATTENDANCE DATA PROVIDER
 * ============================================================
 *
 * PURPOSE:
 * - Read the Employees and Attendance tabs from Google Sheets.
 * - Retrieve both tabs using one batch read request.
 * - Match attendance events to employees using Firebase UID.
 * - Retrieve employee information from the Employees tab.
 * - Convert spreadsheet timestamps into UTC ISO timestamps.
 * - Calculate the number of active employees currently onsite.
 *
 * WHY THIS FILE EXISTS:
 * The attendance controller should not communicate directly
 * with Google Sheets or contain spreadsheet mapping logic.
 *
 * This provider handles data retrieval and supplies the
 * controller with one structured result:
 *
 * {
 *   records: [...],
 *   totalIn: number
 * }
 *
 * GOOGLE SHEETS STRUCTURE:
 *
 * Employees tab:
 * - User ID (Firebase UID)
 * - Employee ID
 * - Full Name
 * - Email
 * - Department
 * - Role (Staff/Admin)
 * - Status (Active/Inactive)
 *
 * Attendance tab:
 * - Event ID
 * - Timestamp
 * - User ID (Firebase UID)
 * - Event Type (Clock In/Clock Out)
 * - Location
 * - Comment
 */


// Google Sheets API client library.
import { google } from "googleapis";

// Reuse the shared timezone service.
// It converts South African local timestamps and Google Sheets
// numeric date serials into consistent UTC ISO timestamps.
import {
  normaliseAttendanceTimestamp,
} from "./timezone.js";


// ============================================================
// 1. GOOGLE SHEETS CONFIGURATION
// ============================================================

/**
 * Returns the configuration needed to access Google Sheets.
 *
 * WHY:
 * The spreadsheet ID and tab names can be configured through
 * the backend .env file without changing this source file.
 */

function getConfiguration() {

  return {

    spreadsheetId: process.env.SPREADSHEET_ID,

    employeesTab:
      process.env.GOOGLE_SHEETS_EMPLOYEES_TAB || "Employees",

    attendanceTab:
      process.env.GOOGLE_SHEETS_ATTENDANCE_TAB || "Attendance",

  };
}


// Google Sheets API permission.
// Read-only access is sufficient for this dashboard integration.

const GOOGLE_SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];


// Cache the API client so it does not need to be recreated
// every time the dashboard refreshes.

let sheetsClient = null;


/**
 * Creates or returns the Google Sheets API client.
 *
 * WHY:
 * Reusing the client avoids repeatedly creating authentication
 * objects during automatic attendance refreshes.
 */

function getSheetsClient() {

  if (sheetsClient) {
    return sheetsClient;
  }

  const clientEmail = String(
    process.env.GOOGLE_CLIENT_EMAIL ?? ""
  ).trim();

  // Google private keys stored in .env commonly contain literal
  // "\n" characters. Convert them into actual line breaks.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")
    .trim();

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google Sheets service-account credentials are missing."
    );
  }

  // Create the Google service-account authentication client.
  const auth = new google.auth.JWT({

    email: clientEmail,

    key: privateKey,

    scopes: GOOGLE_SHEETS_SCOPES,

  });

  // Create and cache the Google Sheets API client.
  sheetsClient = google.sheets({
    version: "v4",
    auth,
  });

  return sheetsClient;
}


// ============================================================
// 2. SPREADSHEET TAB HELPERS
// ============================================================

/**
 * Quotes a Google Sheets tab name before using it in an API range.
 *
 * This also supports tab names containing spaces or apostrophes.
 */

function quoteTabName(tabName) {

  return `'${String(tabName).replace(/'/g, "''")}'`;
}


/**
 * Converts column headers into predictable lookup keys.
 *
 * Examples:
 *
 * "User ID (Firebase UID)"       -> "userid"
 * "Employee ID"                 -> "employeeid"
 * "Full Name"                   -> "fullname"
 * "Status (Active/Inactive)"    -> "status"
 * "Event Type (Clock In/Clock Out)" -> "eventtype"
 *
 * Removing the descriptive text inside parentheses allows
 * the backend to recognise the actual spreadsheet headings.
 */

function normaliseHeader(value) {

  return String(value ?? "")
    .trim()
    .replace(/^attendance\s*:\s*/i, "")
    .replace(/\([^)]*\)/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


/**
 * Converts a sheet's returned values into headers and data rows.
 *
 * The first row contains the column headings.
 * All following rows contain spreadsheet records.
 */

function parseSheetRows(values, tabName) {

  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    !Array.isArray(values[0])
  ) {
    throw new Error(
      `The "${tabName}" tab is empty or has no header row.`
    );
  }

  const headers = values[0].map(normaliseHeader);

  if (!headers.some(Boolean)) {
    throw new Error(
      `The "${tabName}" tab has an invalid header row.`
    );
  }

  return {
    headers,
    rows: values.slice(1),
  };
}


/**
 * Locates a required column using its possible header names.
 *
 * This allows the service to accept minor header variations
 * without depending on fixed spreadsheet column positions.
 */

function findColumn(
  headers,
  possibleNames,
  description,
  tabName,
  required = true
) {

  const possibleHeaders = possibleNames.map(normaliseHeader);

  const columnIndex = headers.findIndex(
    (header) => possibleHeaders.includes(header)
  );

  if (columnIndex === -1 && required) {
    throw new Error(
      `The "${tabName}" tab is missing the required ` +
      `"${description}" column.`
    );
  }

  return columnIndex;
}


/**
 * Reads a cell safely and returns its value as trimmed text.
 *
 * Used for employee IDs, Firebase UIDs, names and event types.
 */

function getCell(row, index) {

  if (index < 0) {
    return "";
  }

  return String(row[index] ?? "").trim();
}


/**
 * Reads a cell without converting its original data type.
 *
 * WHY:
 * Google Sheets can return timestamps as numeric date serials.
 *
 * Converting those numbers into strings before timestamp
 * normalisation would prevent the timezone service from
 * recognising them as numeric spreadsheet dates.
 */

function getRawCell(row, index) {

  if (index < 0) {
    return null;
  }

  return row[index] ?? null;
}


/**
 * Determines whether a spreadsheet row is completely empty.
 *
 * Empty trailing spreadsheet rows should not be processed
 * as employee or attendance records.
 */

function isEmptyRow(row) {

  if (!Array.isArray(row)) {
    return true;
  }

  return !row.some(
    (value) => String(value ?? "").trim() !== ""
  );
}


// ============================================================
// 3. TIMESTAMP NORMALISATION
// ============================================================

/**
 * Converts a Google Sheets timestamp into a UTC ISO timestamp.
 *
 * WHY:
 * Google Sheets can return date/time values without timezone
 * information or as numeric date serials.
 *
 * The shared timezone service handles:
 *
 * - South African local timestamps.
 * - Google Sheets numeric date serials.
 * - UTC timestamps ending in Z.
 * - Timestamps containing explicit timezone offsets.
 * - JavaScript Date objects.
 *
 * Example:
 *
 * Spreadsheet value:
 * 2026-11-17 08:00:00
 *
 * South African timezone:
 * Africa/Johannesburg (UTC+02:00)
 *
 * Normalised result:
 * 2026-11-17T06:00:00.000Z
 *
 * IMPORTANT:
 * The timezone is only applied when the original timestamp
 * does not already contain timezone information.
 *
 * Future attendance events are rejected.
 *
 * @param {string|number|Date} value
 * @returns {string|null}
 */

function normaliseSheetTimestamp(value) {

  // Use the shared timezone implementation.
  const timestamp = normaliseAttendanceTimestamp(value);

  if (!timestamp) {
    return null;
  }

  // Convert the normalised timestamp into milliseconds.
  const timestampMs = Date.parse(timestamp);

  // Reject invalid dates and future attendance events.
  if (
    !Number.isFinite(timestampMs) ||
    timestampMs > Date.now()
  ) {
    return null;
  }

  return timestamp;
}


// ============================================================
// 4. ATTENDANCE EVENT NORMALISATION
// ============================================================

/**
 * Converts supported event labels into standard event types.
 *
 * Supported IN values:
 * - Clock In
 * - Check In
 * - IN
 *
 * Supported OUT values:
 * - Clock Out
 * - Check Out
 * - OUT
 *
 * The returned values are used internally for calculations.
 */

function normaliseEventType(value) {

  const eventType = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (
    ["clockin", "checkin", "in"].includes(eventType)
  ) {
    return "IN";
  }

  if (
    ["clockout", "checkout", "out"].includes(eventType)
  ) {
    return "OUT";
  }

  return null;
}


// ============================================================
// 5. EMPLOYEE LOOKUP USING FIREBASE UID
// ============================================================

/**
 * Builds a lookup of employees using Firebase UID as the key.
 *
 * WHY FIREBASE UID:
 * Both the Employees and Attendance tabs contain Firebase UIDs.
 *
 * The Attendance tab uses a dropdown to select the employee's
 * Firebase UID when a clock-in or clock-out event is recorded.
 *
 * This allows the provider to match attendance records directly
 * to the correct employee.
 *
 * Employee ID remains available for identification and output.
 *
 * REQUIRED EMPLOYEES COLUMNS:
 * - User ID (Firebase UID)
 * - Employee ID
 * - Full Name
 * - Status
 *
 * @param {Array} employeeRows
 * @param {Array} headers
 * @param {string} tabName
 * @returns {Map}
 */

function buildEmployeeLookup(
  employeeRows,
  headers,
  tabName
) {

  // Find the Firebase UID column.
  const uidColumn = findColumn(
    headers,
    [
      "User ID (Firebase UID)",
      "Firebase UID",
      "User ID",
      "UID",
    ],
    "Firebase User ID",
    tabName
  );

  // Find the Employee ID column.
  const employeeIdColumn = findColumn(
    headers,
    ["Employee ID", "Staff ID"],
    "Employee ID",
    tabName
  );

  // Find the employee name column.
  const nameColumn = findColumn(
    headers,
    ["Full Name", "Name"],
    "Full Name",
    tabName
  );

  // Find the account status column.
  const statusColumn = findColumn(
    headers,
    [
      "Status (Active/Inactive)",
      "Status",
      "Employee Status",
    ],
    "Status",
    tabName
  );

  // Firebase UID is now the employee lookup key.
  const employeesByUid = new Map();

  // Employee IDs must also remain unique.
  const employeeIds = new Set();

  for (const row of employeeRows) {

    if (isEmptyRow(row)) {
      continue;
    }

    const userId = getCell(
      row,
      uidColumn
    );

    const employeeId = getCell(
      row,
      employeeIdColumn
    );

    const name = getCell(
      row,
      nameColumn
    );

    const status = getCell(
      row,
      statusColumn
    ).toLowerCase();

    // Every employee must have a Firebase UID, Employee ID and name.
    if (!userId || !employeeId || !name) {
      throw new Error(
        "An Employees row is missing its Firebase UID, " +
        "Employee ID or Full Name."
      );
    }

    // Prevent duplicate Firebase UIDs.
    if (employeesByUid.has(userId)) {
      throw new Error(
        "The Employees tab contains a duplicate Firebase UID."
      );
    }

    // Prevent duplicate Employee IDs.
    if (employeeIds.has(employeeId)) {
      throw new Error(
        "The Employees tab contains a duplicate Employee ID."
      );
    }

    const employee = {

      userId,

      employeeId,

      name,

      // Only explicitly active employees count towards onsite totals.
      active: status === "active",

    };

    employeesByUid.set(userId, employee);

    employeeIds.add(employeeId);
  }

  return employeesByUid;
}


// ============================================================
// 6. EMPLOYEE ATTENDANCE STATUS
// ============================================================

/**
 * Determines an employee's current attendance status using
 * their latest check-in and check-out timestamps.
 *
 * IN:
 * The latest check-in is newer than the latest check-out.
 *
 * OUT:
 * The latest check-out is newer than the latest check-in.
 *
 * UNKNOWN:
 * Both events have the same timestamp or no valid event exists.
 */

function getCurrentEmployeeStatus(record) {

  const checkIn = record.lastCheckInAt;

  const checkOut = record.lastCheckOutAt;

  if (checkIn && checkOut) {

    if (checkIn > checkOut) {
      return "IN";
    }

    if (checkOut > checkIn) {
      return "OUT";
    }

    return "UNKNOWN";
  }

  if (checkIn) {
    return "IN";
  }

  if (checkOut) {
    return "OUT";
  }

  return "UNKNOWN";
}


// ============================================================
// 7. ATTENDANCE RECORD CALCULATION
// ============================================================

/**
 * Processes Attendance rows and connects them to Employees.
 *
 * Each attendance event is matched using Firebase UID.
 *
 * The service keeps the latest check-in and latest check-out
 * timestamp for each employee.
 *
 * The Employee ID is used as the key for the final attendance
 * records so duplicate Firebase UIDs cannot collapse records.
 */

function processAttendanceEvents({

  attendanceRows,

  headers,

  employeesByUid,

  attendanceTab,

}) {

  // Find the optional event ID column.
  const eventIdColumn = findColumn(
    headers,
    [
      "Event ID",
      "Attendance Event ID",
      "Log ID",
    ],
    "Event ID",
    attendanceTab,
    false
  );

  // Find the timestamp column.
  const timestampColumn = findColumn(
    headers,
    [
      "Timestamp",
      "Event Timestamp",
      "Date and Time",
    ],
    "Timestamp",
    attendanceTab
  );

  // Find the Firebase UID column.
  //
  // The actual Attendance tab uses:
  // User ID (Firebase UID)
  //
  // It does not use Employee ID.
  const uidColumn = findColumn(
    headers,
    [
      "User ID (Firebase UID)",
      "Firebase UID",
      "User ID",
      "UID",
    ],
    "Firebase User ID",
    attendanceTab
  );

  // Find the clock event type column.
  const eventTypeColumn = findColumn(
    headers,
    [
      "Event Type (Clock In/Clock Out)",
      "Event Type",
      "Clock Event",
    ],
    "Event Type",
    attendanceTab
  );

  // Store attendance records using Employee ID.
  const recordsByEmployee = new Map();

  let populatedRows = 0;

  let validEvents = 0;

  let unmatchedEvents = 0;

  let invalidEvents = 0;

  for (const row of attendanceRows) {

    if (isEmptyRow(row)) {
      continue;
    }

    populatedRows++;

    // Read the optional event ID.
    // It is not used to identify employees.
    const eventId = getCell(
      row,
      eventIdColumn
    );

    // Retrieve the Firebase UID selected in the dropdown.
    const userId = getCell(
      row,
      uidColumn
    );

    // Read the original timestamp.
    // Keep its original type because it may be a number.
    const rawTimestamp = getRawCell(
      row,
      timestampColumn
    );

    // Read the clock event description.
    const rawEventType = getCell(
      row,
      eventTypeColumn
    );

    // Find the employee using their Firebase UID.
    const employee = employeesByUid.get(userId);

    if (!employee) {
      unmatchedEvents++;
      continue;
    }

    // Convert the timestamp using the shared timezone service.
    const timestamp = normaliseSheetTimestamp(
      rawTimestamp
    );

    // Convert Clock In / Clock Out into standard values.
    const eventType = normaliseEventType(
      rawEventType
    );

    // Events without a valid timestamp or event type cannot
    // safely influence employee attendance status.
    if (!timestamp || !eventType) {

      invalidEvents++;

      // Do not log event IDs or employee identities.
      continue;
    }

    // Retrieve the employee's existing attendance summary.
    let record = recordsByEmployee.get(
      employee.employeeId
    );

    if (!record) {

      record = {

        userId: employee.userId,

        employeeId: employee.employeeId,

        name: employee.name,

        active: employee.active,

        lastCheckInAt: null,

        lastCheckOutAt: null,

      };

      recordsByEmployee.set(
        employee.employeeId,
        record
      );
    }

    // Keep the latest Clock In timestamp.
    if (eventType === "IN") {

      if (
        !record.lastCheckInAt ||
        timestamp > record.lastCheckInAt
      ) {
        record.lastCheckInAt = timestamp;
      }
    }

    // Keep the latest Clock Out timestamp.
    if (eventType === "OUT") {

      if (
        !record.lastCheckOutAt ||
        timestamp > record.lastCheckOutAt
      ) {
        record.lastCheckOutAt = timestamp;
      }
    }

    validEvents++;
  }


  // A genuinely empty Attendance tab is valid.
  // It represents zero recorded attendance events.
  //
  // However, if event rows exist and none can be processed,
  // fail the refresh rather than silently reporting zero staff.

  if (
    populatedRows > 0 &&
    validEvents === 0
  ) {

    throw new Error(
      "No valid attendance events could be processed. " +
      "Check Firebase UID matching, timestamp format " +
      "and event types."
    );
  }


  // Some invalid or unmatched rows may exist alongside valid events.
  // Log counts without exposing employee identities.

  if (
    unmatchedEvents > 0 ||
    invalidEvents > 0
  ) {

    console.warn(
      "[ATTENDANCE DATA WARNING]",
      `${unmatchedEvents} unmatched events and ` +
      `${invalidEvents} invalid events were ignored.`
    );
  }


  // Convert the Map into the employee record array.
  const records = [...recordsByEmployee.values()]

    .map((record) => ({

      userId: record.userId,

      employeeId: record.employeeId,

      name: record.name,

      lastCheckInAt: record.lastCheckInAt,

      lastCheckOutAt: record.lastCheckOutAt,

    }))

    .sort(
      (first, second) =>
        first.name.localeCompare(second.name)
    );


  // Count unique employees who:
  // 1. Are marked Active in the Employees tab.
  // 2. Have a latest valid Clock In event.
  // 3. Do not have a newer Clock Out event.
  //
  // Employee ID is the Map key, so duplicate Firebase UIDs
  // cannot cause distinct employee records to collapse.

  const totalIn = [...recordsByEmployee.values()].filter(
    (record) =>
      record.active &&
      getCurrentEmployeeStatus(record) === "IN"
  ).length;


  return {

    records,

    totalIn,

  };
}


// ============================================================
// 8. MAIN LIVE ATTENDANCE PROVIDER
// ============================================================

/**
 * Retrieves the information required by the live dashboard.
 *
 * PERFORMANCE:
 *
 * Both tabs are retrieved using one Google Sheets batchGet call.
 *
 * Previously:
 * - Different services could independently read the spreadsheet.
 *
 * Now:
 * - One request retrieves both tabs.
 * - Attendance records and onsite total use the same snapshot.
 * - Fewer Google Sheets API requests are generated.
 *
 * RETURNS:
 * {
 *   records: [...],
 *   totalIn: number
 * }
 */

export async function getLiveAttendanceData() {

  try {

    const config = getConfiguration();

    if (!config.spreadsheetId) {
      throw new Error(
        "SPREADSHEET_ID is missing from the backend environment."
      );
    }

    // Get the reusable Google Sheets API client.
    const sheets = getSheetsClient();


    // Prepare both tab ranges.
    const employeesRange =
      `${quoteTabName(config.employeesTab)}!A:Z`;

    const attendanceRange =
      `${quoteTabName(config.attendanceTab)}!A:Z`;


    // Retrieve both tabs together.
    //
    // UNFORMATTED_VALUE returns actual underlying cell values.
    //
    // SERIAL_NUMBER returns Google Sheets date/time values
    // as numeric date serials rather than formatted strings.
    //
    // timezone.js understands these numeric values and
    // converts them into consistent UTC timestamps.

    const response = await sheets.spreadsheets.values.batchGet({

      spreadsheetId: config.spreadsheetId,

      ranges: [
        employeesRange,
        attendanceRange,
      ],

      valueRenderOption: "UNFORMATTED_VALUE",

      dateTimeRenderOption: "SERIAL_NUMBER",

    });


    // Retrieve the two returned spreadsheet ranges.
    const valueRanges =
      response.data.valueRanges ?? [];

    if (valueRanges.length !== 2) {
      throw new Error(
        "Google Sheets did not return both required tab ranges."
      );
    }


    // Separate the Employees and Attendance tab values.
    const employeesSheet = parseSheetRows(
      valueRanges[0].values ?? [],
      config.employeesTab
    );

    const attendanceSheet = parseSheetRows(
      valueRanges[1].values ?? [],
      config.attendanceTab
    );


    // Build the employee lookup using Firebase UID.
    const employeesByUid = buildEmployeeLookup(
      employeesSheet.rows,
      employeesSheet.headers,
      config.employeesTab
    );

    if (employeesByUid.size === 0) {
      throw new Error(
        "No employee records were found in the Employees tab."
      );
    }


    // Calculate attendance records and onsite count from
    // the same batch-read spreadsheet snapshot.
    const result = processAttendanceEvents({

      attendanceRows: attendanceSheet.rows,

      headers: attendanceSheet.headers,

      employeesByUid,

      attendanceTab: config.attendanceTab,

    });


    // Give the controller the structured response it expects.
    return {

      records: result.records,

      totalIn: result.totalIn,

    };

  } catch (error) {

    // Log the actual provider failure for backend troubleshooting.
    console.error(
      "[ATTENDANCE DATA PROVIDER FAILED]",
      error.message
    );

    // Let the controller handle the failed refresh and preserve
    // its previous successful cache.
    throw error;
  }
}


// ============================================================
// 9. EXPORTS
// ============================================================

// Support named and default imports.
export default getLiveAttendanceData;
