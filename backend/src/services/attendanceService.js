
/**
 * ============================================================
 * ATTENDANCE TIMESTAMP SERVICE
 * ============================================================
 *
 * PURPOSE:
 * - Connect directly to Google Sheets.
 * - Authenticate using the shared backend environment variables.
 * - Retrieve attendance records from the configured sheet.
 * - Convert spreadsheet rows into JavaScript objects.
 * - Validate employee IDs, event types and timestamps.
 * - Identify the latest check-in and check-out per employee.
 * - Return processed timestamps for dashboard display.
 *
 * SCOPE:
 * This service only handles timestamp retrieval and processing.
 * It does not calculate employee attendance status or totals.
 */


// ============================================================
// 1. IMPORT DEPENDENCIES
// ============================================================

// Google API library for accessing Google Sheets.
import { google } from "googleapis";

// Load the backend environment variables.
import dotenv from "dotenv";

// Resolve the backend .env file relative to this service.
import { fileURLToPath } from "node:url";

// Load the shared environment file without overwriting
// environment variables that have already been supplied.
dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});


/**
 * ============================================================
 * 2. NORMALISE THE GOOGLE PRIVATE KEY
 * ============================================================
 *
 * Prepares the private key for Google authentication.
 *
 * Supports keys stored with escaped newline characters
 * and keys supplied as raw base64 content without PEM headers.
 *
 * WHY:
 * Google authentication requires a correctly formatted
 * private key. This function prepares the configured value
 * without changing the shared .env file.
 */
function normalisePrivateKey(value) {
  let key = String(value ?? "")
    .trim()
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");

  if (!key) {
    throw new Error("Google private key is missing.");
  }

  // Keep an existing PEM-formatted private key unchanged.
  if (key.includes("-----BEGIN PRIVATE KEY-----")) {
    return key;
  }

  // Remove whitespace so the raw key can be wrapped correctly.
  const base64Content = key.replace(/\s+/g, "");

  // Reject values that do not contain valid base64 characters.
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64Content)) {
    throw new Error("Google private key has an invalid format.");
  }

  // Restore the PEM header and footer around the raw key.
  const formattedContent = base64Content.match(/.{1,64}/g);

  return [
    "-----BEGIN PRIVATE KEY-----",
    ...formattedContent,
    "-----END PRIVATE KEY-----",
  ].join("\n");
}


/**
 * ============================================================
 * 3. GOOGLE SHEETS AUTHENTICATION
 * ============================================================
 *
 * Creates an authenticated Google Sheets API client.
 *
 * Uses the existing shared environment variable names:
 *
 * GOOGLE_CLIENT_EMAIL
 * GOOGLE_PRIVATE_KEY
 *
 * WHY:
 * The backend needs authorised access to retrieve
 * the spreadsheet records.
 *
 * Read-only permission prevents this service from modifying
 * spreadsheet contents.
 */
async function getGoogleSheetsClient() {

  // Retrieve the service account email.
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  // Retrieve and prepare the private key.
  const privateKey = normalisePrivateKey(
    process.env.GOOGLE_PRIVATE_KEY
  );

  // Stop authentication if the service account email is missing.
  if (!clientEmail) {
    throw new Error(
      "GOOGLE_CLIENT_EMAIL is missing from the environment."
    );
  }

  // Configure Google service account authentication.
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },

    // Grant permission to read spreadsheet information.
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });

  // Return the authenticated Google Sheets client.
  return google.sheets({
    version: "v4",
    auth,
  });
}


/**
 * ============================================================
 * 4. RETRIEVE THE GOOGLE SHEETS DATA
 * ============================================================
 *
 * Connects to Google Sheets and retrieves the configured
 * spreadsheet range.
 *
 * Uses the existing environment variables:
 *
 * SPREADSHEET_ID
 * SHEET_RANGE
 *
 * WHY:
 * The attendance service needs to retrieve the actual
 * employee and clock-event records before processing
 * their timestamps.
 *
 * @returns {Promise<Array>} Raw spreadsheet rows.
 */
export async function getAttendanceSheetValues() {

  // Retrieve the spreadsheet ID from the shared environment.
  const spreadsheetId = process.env.SPREADSHEET_ID;

  // Retrieve the configured spreadsheet range.
  const range = process.env.SHEET_RANGE;

  // Check that the spreadsheet ID exists.
  if (!spreadsheetId) {
    throw new Error(
      "SPREADSHEET_ID is missing from the environment."
    );
  }

  // Check that the spreadsheet range exists.
  if (!range) {
    throw new Error(
      "SHEET_RANGE is missing from the environment."
    );
  }

  // Authenticate before requesting spreadsheet information.
  const sheets = await getGoogleSheetsClient();

  // Request the configured spreadsheet range.
  const response = await sheets.spreadsheets.values.get({

    spreadsheetId,

    range,

    majorDimension: "ROWS",

    // Retrieve stored values rather than visual formatting.
    valueRenderOption: "UNFORMATTED_VALUE",

  });

  // Return the spreadsheet rows.
  // An empty spreadsheet response becomes an empty array.
  return response.data.values ?? [];
}


/**
 * ============================================================
 * 5. NORMALISE GOOGLE SHEETS HEADERS
 * ============================================================
 *
 * Converts spreadsheet column headings into consistent
 * JavaScript property names.
 *
 * WHY:
 * Consistent property names make spreadsheet records
 * easier to process throughout the service.
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


/**
 * ============================================================
 * 6. CONVERT GOOGLE SHEETS ROWS INTO OBJECTS
 * ============================================================
 *
 * Uses the first spreadsheet row as column headings
 * and converts the remaining rows into JavaScript objects.
 *
 * Empty spreadsheet rows are ignored.
 *
 * WHY:
 * Objects allow the service to access employee and clock-event
 * data through property names instead of column positions.
 *
 * @param {Array} values - Raw Google Sheets rows.
 * @returns {Array<Object>} Converted spreadsheet records.
 */
export function mapSheetRowsToObjects(values = []) {

  // Check that the spreadsheet response contains usable rows.
  if (!Array.isArray(values) || values.length < 2) {
    return [];
  }

  // Separate the column headings from the data rows.
  const [headers, ...rows] = values;

  // Prevent processing when the header row is invalid.
  if (!Array.isArray(headers)) {
    return [];
  }

  // Convert spreadsheet headings into JavaScript property names.
  const normalisedHeaders = headers.map(normaliseHeader);

  // Convert each remaining spreadsheet row into an object.
  return rows
    .filter(
      (row) =>
        Array.isArray(row) &&
        row.some(
          (cell) =>
            cell !== null &&
            cell !== undefined &&
            String(cell).trim() !== ""
        )
    )
    .map((row) => {

      // Create an object for the current spreadsheet record.
      const record = {};

      // Associate each cell with its corresponding heading.
      normalisedHeaders.forEach((header, index) => {

        // Ignore columns without a valid heading.
        if (!header) return;

        // Store the spreadsheet value under its property name.
        // Missing cells become empty strings.
        record[header] = row[index] ?? "";
      });

      return record;
    });
}


/**
 * ============================================================
 * 7. PREPARE EMPLOYEE RECORDS
 * ============================================================
 *
 * Extracts employee IDs and names from the retrieved sheet.
 *
 * Because the shared configuration uses one spreadsheet tab,
 * employee information is collected from the same records
 * that contain the clock events.
 *
 * WHY:
 * Employee IDs are needed to connect clock events to the
 * correct employee. Names identify employees on the dashboard.
 *
 * Duplicate employee records are combined into one record.
 *
 * @param {Array} values - Raw spreadsheet rows.
 * @returns {Array<Object>} Unique employee records.
 */
export function mapStaffSheetValues(values = []) {

  const rows = mapSheetRowsToObjects(values);

  // Use a Map to prevent duplicate employee records.
  const employees = new Map();

  for (const row of rows) {

    // Retrieve and standardise the employee ID.
    const employeeId = normaliseEmployeeId(
      row.employeeId ?? row.staffId ?? row.id
    );

    // Employee IDs are required for matching clock events.
    if (!employeeId) {
      continue;
    }

    // Preserve an existing employee record if one exists.
    const existing = employees.get(employeeId);

    // Store employee information.
    employees.set(employeeId, {
      employeeId,

      // Preserve an existing name if a later row has no name.
      name: String(
        row.name ??
        row.fullName ??
        existing?.name ??
        ""
      ).trim(),
    });
  }

  return Array.from(employees.values());
}


/**
 * ============================================================
 * 8. PREPARE CLOCK EVENT RECORDS
 * ============================================================
 *
 * Extracts clock event information from the spreadsheet.
 *
 * Each record is checked later for:
 * - Employee ID.
 * - Clock event type.
 * - Timestamp.
 *
 * WHY:
 * Preparing the records in a consistent format allows
 * the timestamp processing function to validate them.
 *
 * @param {Array} values - Raw spreadsheet rows.
 * @returns {Array<Object>} Prepared clock event records.
 */
export function mapClockEventSheetValues(values = []) {

  const rows = mapSheetRowsToObjects(values);

  return rows.map((row) => ({

    // Identify the employee associated with the event.
    employeeId: row.employeeId ?? row.staffId ?? "",

    // Retrieve the clock action type.
    event:
      row.event ??
      row.eventType ??
      row.clockEvent ??
      row.action ??
      "",

    // Retrieve the original recorded timestamp.
    timestamp:
      row.timestamp ??
      row.eventTimestamp ??
      row.createdAt ??
      "",

  }));
}


/**
 * ============================================================
 * 9. NORMALISE EMPLOYEE IDS
 * ============================================================
 *
 * Converts employee identifiers into consistent strings.
 *
 * WHY:
 * Identifiers returned by different data sources may have
 * different data types. Standardising them ensures that
 * clock events are matched to the correct employee.
 */
function normaliseEmployeeId(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


/**
 * ============================================================
 * 10. NORMALISE CLOCK EVENT TYPES
 * ============================================================
 *
 * Converts recognised clock event descriptions into
 * consistent IN or OUT values.
 *
 * Unrecognised event types are rejected.
 *
 * WHY:
 * The service must distinguish check-in events from
 * check-out events before processing their timestamps.
 */
function normaliseEventType(value) {

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
 * ============================================================
 * 11. VALIDATE AND NORMALISE TIMESTAMPS
 * ============================================================
 *
 * Checks incoming timestamps and converts valid values
 * into a standard UTC format.
 *
 * Requires timestamps to include explicit timezone information.
 *
 * WHY:
 * Consistent timezone handling prevents the backend and
 * dashboard from interpreting the same clock event differently.
 *
 * Invalid timestamps are rejected.
 *
 * @param {string|Date} value - Incoming timestamp.
 * @returns {string|null} Valid UTC timestamp or null.
 */
function normaliseTimestamp(value) {

  // Reject missing timestamp values.
  if (!value) {
    return null;
  }

  // Support valid JavaScript Date objects.
  if (value instanceof Date) {

    if (!Number.isFinite(value.getTime())) {
      return null;
    }

    return value.toISOString();
  }

  // Only process string timestamps from the spreadsheet.
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = value.trim();

  // Require ISO 8601 format with an explicit timezone.
  const validISOFormat =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

  if (!validISOFormat.test(timestamp)) {
    return null;
  }

  // Convert the timestamp into a Date object.
  const date = new Date(timestamp);

  // Reject invalid date values.
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  // Return the standardised UTC timestamp.
  return date.toISOString();
}


/**
 * ============================================================
 * 12. PROCESS EMPLOYEE CLOCK TIMESTAMPS
 * ============================================================
 *
 * MAIN PROCESSING FUNCTION
 *
 * Receives employee records and clock event records.
 *
 * Identifies the latest valid check-in and check-out
 * timestamp for each employee.
 *
 * WHY:
 * The dashboard needs the correct timestamps for employee
 * clock actions. This function prepares that information.
 *
 * It does not calculate employee attendance status or totals.
 *
 * @param {Object} data
 * @param {Array} data.staff - Employee records.
 * @param {Array} data.clockEvents - Clock event records.
 *
 * @returns {Array<Object>} Employee timestamp information.
 */
export function getAttendanceTimestamps({
  staff = [],
  clockEvents = [],
} = {}) {

  // Protect the function against unexpected input types.
  const safeStaff = Array.isArray(staff) ? staff : [];

  const safeClockEvents = Array.isArray(clockEvents)
    ? clockEvents
    : [];

  // Store timestamp information using employee IDs.
  const employeeTimestamps = new Map();


  /**
   * STEP 1: INITIALISE EMPLOYEE RECORDS
   *
   * Create a timestamp record for each employee.
   *
   * WHY:
   * Employees must be identifiable even when they have
   * no recorded clock events.
   */
  for (const employee of safeStaff) {

    // Standardise the employee identifier.
    const employeeId = normaliseEmployeeId(
      employee.employeeId ?? employee.staffId ?? employee.id
    );

    // Ignore employee records without identifiers.
    if (!employeeId) {
      continue;
    }

    employeeTimestamps.set(employeeId, {

      employeeId,

      // Store the employee name for dashboard identification.
      name: String(
        employee.name ?? employee.fullName ?? ""
      ).trim(),

      // Initialise the latest check-in timestamp.
      lastCheckInAt: null,

      // Initialise the latest check-out timestamp.
      lastCheckOutAt: null,

    });
  }


  /**
   * STEP 2: VALIDATE CLOCK EVENTS
   *
   * Validate the employee ID, event type and timestamp
   * before processing a clock event.
   *
   * WHY:
   * Invalid records must not update dashboard timestamps.
   */
  const validEvents = safeClockEvents

    .map((event) => ({

      employeeId: normaliseEmployeeId(
        event.employeeId ?? event.staffId
      ),

      event: normaliseEventType(
        event.event ??
        event.eventType ??
        event.clockEvent ??
        event.action
      ),

      timestamp: normaliseTimestamp(
        event.timestamp ?? event.createdAt
      ),

    }))

    // Reject incomplete or invalid clock event records.
    .filter(
      (event) =>
        event.employeeId &&
        event.event &&
        event.timestamp
    );


  /**
   * STEP 3: IDENTIFY THE LATEST TIMESTAMPS
   *
   * Compare incoming timestamps with the previously stored
   * timestamp for the same employee and event type.
   *
   * WHY:
   * Spreadsheet rows may not be arranged chronologically.
   * Comparing timestamps ensures that older events do not
   * replace more recent clock actions.
   */
  for (const event of validEvents) {

    // Locate the employee connected to the clock event.
    const employee = employeeTimestamps.get(event.employeeId);

    // Ignore events that cannot be matched to an employee.
    if (!employee) {
      continue;
    }

    // Convert the timestamp into milliseconds for comparison.
    const eventTime = Date.parse(event.timestamp);


    // Process the latest check-in timestamp.
    if (event.event === "IN") {

      const previousCheckIn = employee.lastCheckInAt
        ? Date.parse(employee.lastCheckInAt)
        : -Infinity;

      // Only update the timestamp when the incoming event
      // is more recent than the previously stored event.
      if (eventTime > previousCheckIn) {
        employee.lastCheckInAt = event.timestamp;
      }
    }


    // Process the latest check-out timestamp.
    else if (event.event === "OUT") {

      const previousCheckOut = employee.lastCheckOutAt
        ? Date.parse(employee.lastCheckOutAt)
        : -Infinity;

      // Only update the timestamp when the incoming event
      // is more recent than the previously stored event.
      if (eventTime > previousCheckOut) {
        employee.lastCheckOutAt = event.timestamp;
      }
    }
  }


  /**
   * STEP 4: RETURN THE PROCESSED DATA
   *
   * Convert the employee Map into an array.
   *
   * WHY:
   * The frontend can iterate through an array of employee
   * timestamp records and display the required information.
   */
  return Array.from(employeeTimestamps.values());
}


/**
 * ============================================================
 * 13. MAIN GOOGLE SHEETS ATTENDANCE FUNCTION
 * ============================================================
 *
 * This is the main function called by the backend controller.
 *
 * It performs the complete process:
 *
 * - Authenticates with Google Sheets.
 * - Retrieves the configured spreadsheet range.
 * - Converts spreadsheet rows into JavaScript objects.
 * - Prepares employee and clock event records.
 * - Validates and processes timestamps.
 * - Returns the latest timestamps for dashboard display.
 *
 * WHY:
 * This keeps spreadsheet retrieval and timestamp processing
 * together inside the attendance service.
 *
 * @returns {Promise<Array<Object>>} Dashboard timestamp records.
 */
export async function getAttendanceTimestampsFromSheets() {

  try {

    // Retrieve the actual spreadsheet records from Google.
    const sheetValues = await getAttendanceSheetValues();

    // Convert the employee information into unique records.
    const staff = mapStaffSheetValues(sheetValues);

    // Convert the clock event information into records.
    const clockEvents = mapClockEventSheetValues(sheetValues);

    // Process and return the latest employee timestamps.
    return getAttendanceTimestamps({
      staff,
      clockEvents,
    });

  } catch (error) {

    // Record the error for backend debugging.
    console.error(
      "Attendance timestamp service failed:",
      error.message
    );

    // Pass the failure to the calling controller.
    throw new Error(
      `Unable to retrieve attendance timestamps: ${error.message}`,
      { cause: error }
    );
  }
}


/**
 * ============================================================
 * 14. FORMAT TIMESTAMPS FOR DASHBOARD DISPLAY
 * ============================================================
 *
 * Converts UTC timestamps into South African local time
 * for dashboard presentation.
 *
 * WHY:
 * Users should see clock actions in the appropriate local
 * timezone while the original stored timestamps remain UTC.
 *
 * @param {string} timestamp - Validated ISO timestamp.
 * @returns {string} Formatted dashboard timestamp.
 */
export function formatAttendanceTimestamp(timestamp) {

  // Handle employees without a recorded clock action.
  if (!timestamp) {
    return "Not recorded";
  }

  // Convert the timestamp into a Date object.
  const date = new Date(timestamp);

  // Reject invalid timestamp values.
  if (!Number.isFinite(date.getTime())) {
    return "Invalid timestamp";
  }

  // Format the timestamp using South African local time.
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Africa/Johannesburg",
  }).format(date);
}
