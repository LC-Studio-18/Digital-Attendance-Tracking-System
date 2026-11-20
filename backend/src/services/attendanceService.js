
/**
 * ============================================================
 * ATTENDANCE TIMESTAMP SERVICE
 * ============================================================
 *
 * PURPOSE:
 * - Authenticate directly with Google Sheets.
 * - Retrieve Users and Events spreadsheet tabs.
 * - Identify spreadsheet tabs using their column headings.
 * - Match employee records using Firebase UIDs.
 * - Validate clock event types and timestamps.
 * - Reject future-dated clock events.
 * - Identify the latest check-in timestamp per employee.
 * - Identify the latest check-out timestamp per employee.
 * - Standardise timestamps into UTC.
 * - Format timestamps for South African dashboard display.
 *
 * IMPORTANT:
 * This service handles its own Google Sheets connection.
 * It does not depend on a separate spreadsheet service.
 *
 * SCOPE:
 * This service only handles check-in and check-out timestamps.
 * It does not calculate attendance status or workforce totals.
 */


// ============================================================
// 1. IMPORT DEPENDENCIES
// ============================================================

// Google API library for spreadsheet access.
import { google } from "googleapis";

// Load backend environment variables.
import dotenv from "dotenv";

// Resolve the backend environment file.
import { fileURLToPath } from "node:url";

// Validate and prepare RSA private keys.
import { createPrivateKey } from "node:crypto";

import {
  normaliseAttendanceTimestamp,
} from "./timezone.js";


// ============================================================
// 2. LOAD SHARED ENVIRONMENT VARIABLES
// ============================================================

/**
 * Locate the shared backend .env file.
 *
 * WHY:
 * The service requires the Google service account credentials
 * and spreadsheet ID to retrieve attendance records.
 */
const ENV_PATH = fileURLToPath(
  new URL("../../.env", import.meta.url)
);

// Load environment variables without overwriting values
// already supplied by the running environment.
dotenv.config({
  path: ENV_PATH,
  override: false,
});


// ============================================================
// 3. CLEAN ENVIRONMENT VALUES
// ============================================================

/**
 * Remove unnecessary whitespace and surrounding quotation marks.
 *
 * WHY:
 * Environment values may contain quotation marks that should
 * not be included in authentication or API requests.
 */
function cleanEnvValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "");
}


// ============================================================
// 4. VALIDATE AND NORMALISE GOOGLE PRIVATE KEY
// ============================================================

/**
 * Prepare the Google service account private key.
 *
 * WHY:
 * Google authentication requires a correctly formatted
 * RSA private key.
 *
 * This function:
 * - Removes surrounding quotation marks.
 * - Restores escaped newline characters.
 * - Validates the PEM structure.
 * - Checks that Node.js can decode the private key.
 * - Returns a consistent PKCS#8 PEM representation.
 *
 * The private key is never returned to the frontend.
 */
function normalisePrivateKey(value) {

  // Clean the incoming private key.
  let key = cleanEnvValue(value)
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!key) {
    throw new Error("Google private key is missing.");
  }

  // Restore PEM boundaries if only the Base64 key content exists.
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {

    const base64Content = key.replace(/\s+/g, "");

    if (!/^[A-Za-z0-9+/]+=*$/.test(base64Content)) {
      throw new Error(
        "Google private key contains invalid characters."
      );
    }

    const keyLines = base64Content.match(/.{1,64}/g);

    key = [
      "-----BEGIN PRIVATE KEY-----",
      ...keyLines,
      "-----END PRIVATE KEY-----",
    ].join("\n");
  }

  try {

    // Parse the private key using Node.js cryptography.
    const parsedKey = createPrivateKey({
      key,
      format: "pem",
    });

    // Google service account keys must use RSA.
    if (parsedKey.asymmetricKeyType !== "rsa") {
      throw new Error("The private key must use RSA.");
    }

    // Export the parsed key in a consistent PKCS#8 format.
    return parsedKey.export({
      type: "pkcs8",
      format: "pem",
    }).toString();

  } catch (error) {

    throw new Error(
      `Google private key validation failed: ${error.message}`
    );
  }
}


// ============================================================
// 5. GOOGLE SHEETS AUTHENTICATION
// ============================================================

/**
 * Authenticate the backend with Google Sheets.
 *
 * Uses the existing shared environment variables:
 * - GOOGLE_CLIENT_EMAIL
 * - GOOGLE_PRIVATE_KEY
 *
 * WHY:
 * The backend requires authorised access to retrieve
 * employee and clock event records.
 *
 * JWT authentication is used instead of the deprecated
 * GoogleAuth credentials configuration.
 *
 * Read-only permission prevents this service from modifying
 * the spreadsheet.
 */
async function getGoogleSheetsClient() {

  // Retrieve the Google service account email.
  const clientEmail = cleanEnvValue(
    process.env.GOOGLE_CLIENT_EMAIL
  );

  // Retrieve and validate the Google private key.
  const privateKey = normalisePrivateKey(
    process.env.GOOGLE_PRIVATE_KEY
  );

  if (!clientEmail) {
    throw new Error(
      "GOOGLE_CLIENT_EMAIL is missing from the environment."
    );
  }

  // Create the Google service account JWT client.
  const auth = new google.auth.JWT({

    email: clientEmail,

    key: privateKey,

    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],

  });

  // Complete authentication before accessing spreadsheet data.
  await auth.authorize();

  // Return the authenticated Google Sheets API client.
  return google.sheets({
    version: "v4",
    auth,
  });
}


// ============================================================
// 6. RETRIEVE GOOGLE SHEETS TABS
// ============================================================

/**
 * Retrieve the available spreadsheet tabs and their records.
 *
 * Uses the existing environment variable:
 * SPREADSHEET_ID
 *
 * WHY:
 * The attendance system stores employee information and
 * clock events in separate spreadsheet tabs.
 *
 * The service retrieves the available tabs and identifies
 * the required ones using their column headings.
 *
 * @returns {Promise<Array<Object>>} Spreadsheet tab records.
 */
export async function getAttendanceSheetTables() {

  // Retrieve the configured spreadsheet ID.
  const spreadsheetId = cleanEnvValue(
    process.env.SPREADSHEET_ID
  );

  if (!spreadsheetId) {
    throw new Error(
      "SPREADSHEET_ID is missing from the environment."
    );
  }

  // Authenticate with Google Sheets.
  const sheets = await getGoogleSheetsClient();

  // Retrieve spreadsheet metadata.
  const spreadsheetInfo = await sheets.spreadsheets.get({

    spreadsheetId,

    fields: "sheets.properties(sheetId,title)",

  });

  // Retrieve the spreadsheet tab information.
  const sheetProperties = (
    spreadsheetInfo.data.sheets ?? []
  )
    .map((sheet) => sheet.properties)
    .filter((properties) => properties?.title);

  if (sheetProperties.length === 0) {
    throw new Error(
      "The Google spreadsheet does not contain any tabs."
    );
  }

  // Create a retrieval range for every available tab.
  const ranges = sheetProperties.map(({ title }) => {

    // Escape apostrophes in spreadsheet tab names.
    const escapedTitle = title.replace(/'/g, "''");

    // Retrieve all records in columns A through Z.
    return `'${escapedTitle}'!A:Z`;
  });

  // Retrieve all spreadsheet tabs in one API request.
  const response = await sheets.spreadsheets.values.batchGet({

    spreadsheetId,

    ranges,

    majorDimension: "ROWS",

    // Retrieve original stored values rather than visual formatting.
    valueRenderOption: "UNFORMATTED_VALUE",

    dateTimeRenderOption: "SERIAL_NUMBER",




  });

  // Associate each retrieved tab with its original name.
  return sheetProperties.map((properties, index) => ({

    sheetId: properties.sheetId,

    title: properties.title,

    values:
      response.data.valueRanges?.[index]?.values ?? [],

  }));
}


// ============================================================
// 7. NORMALISE GOOGLE SHEETS HEADERS
// ============================================================

/**
 * Convert spreadsheet headings into consistent JavaScript keys.
 *
 * WHY:
 * Standardised headings allow the service to recognise
 * the Users and Events tabs regardless of spaces or punctuation.
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
// 8. CONVERT SPREADSHEET ROWS INTO OBJECTS
// ============================================================

/**
 * Convert spreadsheet rows into JavaScript objects.
 *
 * The first row contains the column headings.
 *
 * WHY:
 * Objects make it easier to retrieve employee information
 * and clock event records using consistent property names.
 *
 * Empty spreadsheet rows are ignored.
 *
 * @param {Array} values - Raw spreadsheet rows.
 * @returns {Array<Object>} Converted spreadsheet records.
 */
export function mapSheetRowsToObjects(values = []) {

  // Check that spreadsheet headings and records exist.
  if (!Array.isArray(values) || values.length < 2) {
    return [];
  }

  // Separate headings from spreadsheet records.
  const [headers, ...rows] = values;

  if (!Array.isArray(headers)) {
    return [];
  }

  // Convert headings into consistent JavaScript keys.
  const normalisedHeaders = headers.map(normaliseHeader);

  // Convert spreadsheet rows into JavaScript objects.
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

      const record = {};

      // Match each spreadsheet cell with its column heading.
      normalisedHeaders.forEach((header, index) => {

        // Ignore columns without valid headings.
        if (!header) return;

        // Store missing spreadsheet cells as empty strings.
        record[header] = row[index] ?? "";
      });

      return record;
    });
}


// ============================================================
// 9. IDENTIFY USERS AND EVENTS TABS
// ============================================================

/**
 * Identify a spreadsheet tab using required column headings.
 *
 * WHY:
 * The service should not depend on fixed tab names.
 * It identifies each tab using its actual spreadsheet structure.
 *
 * @param {Array} sheetTables - Retrieved spreadsheet tabs.
 * @param {Array} requiredHeaders - Required column names.
 * @param {string} description - Tab description for errors.
 * @returns {Object} Matching spreadsheet tab.
 */
function findSheetByHeaders(
  sheetTables,
  requiredHeaders,
  description
) {

  const matchingSheet = sheetTables.find((sheet) => {

    if (!Array.isArray(sheet.values) || sheet.values.length === 0) {
      return false;
    }

    const headers = sheet.values[0].map(normaliseHeader);

    return requiredHeaders.every((requiredHeader) =>
      headers.includes(requiredHeader)
    );
  });

  if (!matchingSheet) {
    throw new Error(
      `Unable to identify the ${description} spreadsheet tab. ` +
      "Check that its required column headings are present."
    );
  }

  return matchingSheet;
}


// ============================================================
// 10. NORMALISE EMPLOYEE IDENTIFIERS
// ============================================================

/**
 * Standardise Firebase user IDs and employee identifiers.
 *
 * WHY:
 * The Users and Events tabs both use Firebase UIDs.
 * Consistent IDs ensure clock events are matched to
 * the correct employee.
 */
function normaliseIdentifier(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


// ============================================================
// 11. PREPARE USERS SHEET DATA
// ============================================================

/**
 * Convert Users tab records into employee objects.
 *
 * REQUIRED COLUMNS:
 * - User ID (Firebase UID)
 * - Employee ID
 * - Full Name
 * - Email
 * - Department
 * - Role (Staff/Admin)
 * - Status (Active/Inactive)
 *
 * WHY:
 * Firebase UID connects employee information to clock events.
 * Employee ID and name provide dashboard identification.
 *
 * @param {Array} values - Raw Users spreadsheet rows.
 * @returns {Array<Object>} Prepared employee records.
 */
export function mapStaffSheetValues(values = []) {

  const rows = mapSheetRowsToObjects(values);

  const employees = new Map();

  for (const row of rows) {

    // Retrieve the Firebase UID.
    const userId = normaliseIdentifier(
      row.userIdFirebaseUid ??
      row.firebaseUid ??
      row.userId ??
      row.uid
    );

    if (!userId) {
      continue;
    }

    // Preserve an existing employee record if one exists.
    const existing = employees.get(userId);

    // Retrieve the employee's display name.
    const name = String(
      row.fullName ??
      row.name ??
      existing?.name ??
      ""
    ).trim();

    // Store employee information.
    employees.set(userId, {

      userId,

      employeeId: normaliseIdentifier(row.employeeId),

      name,

    });
  }

  return Array.from(employees.values());
}


// ============================================================
// 12. PREPARE EVENTS SHEET DATA
// ============================================================

/**
 * Convert Events tab records into clock event objects.
 *
 * REQUIRED COLUMNS:
 * - Event ID
 * - Timestamp
 * - User ID
 * - Event Type (Clock In/Clock Out)
 * - Location
 * - Comment
 *
 * WHY:
 * The timestamp service only needs the event identifier,
 * Firebase UID, event type and recorded timestamp.
 *
 * Location and Comment are not needed for this requirement.
 *
 * @param {Array} values - Raw Events spreadsheet rows.
 * @returns {Array<Object>} Prepared clock event records.
 */
export function mapClockEventSheetValues(values = []) {

  const rows = mapSheetRowsToObjects(values);

  return rows.map((row) => ({

    // Retrieve the unique event identifier.
    eventId: row.eventId ?? "",

    // Identify the employee through their Firebase UID.
   userId: normaliseIdentifier(
  row.userIdFirebaseUid ??
  row.userId ??
  row.firebaseUid ??
  row.uid
),

    // Retrieve the recorded clock action.
    eventType:
      row.eventTypeClockInClockOut ??
      row.eventType ??
      row.event ??
      "",

    // Retrieve the original event timestamp.
    timestamp:
      row.timestamp ??
      row.eventTimestamp ??
      row.createdAt ??
      "",

  }));
}


// ============================================================
// 13. NORMALISE CLOCK EVENT TYPES
// ============================================================

/**
 * Convert recognised event descriptions into consistent values.
 *
 * WHY:
 * The service must distinguish clock-in actions from
 * clock-out actions before updating employee timestamps.
 *
 * Unrecognised event descriptions are rejected.
 *
 * @param {string} value - Incoming clock event type.
 * @returns {string|null} Normalised event type.
 */
function normaliseEventType(value) {

  const event = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  // Recognise clock-in actions.
  if (["CLOCKIN", "CHECKIN", "IN"].includes(event)) {
    return "IN";
  }

  // Recognise clock-out actions.
  if (["CLOCKOUT", "CHECKOUT", "OUT"].includes(event)) {
    return "OUT";
  }

  return null;
}


// ============================================================
// 14. VALIDATE AND NORMALISE TIMESTAMPS
// ============================================================

/**
 * Validate incoming timestamps and convert them into UTC.
 *
 * Requires:
 * - A valid date.
 * - A valid time.
 * - Explicit timezone information.
 * - A timestamp that is not in the future.
 *
 * WHY:
 * This prevents malformed, ambiguous or future-dated
 * clock events from appearing on the dashboard.
 *
 * @param {string|Date} value - Incoming timestamp.
 * @param {number} nowMs - Current backend time in milliseconds.
 * @returns {string|null} Valid UTC timestamp or null.
 */
/**
 * Uses the shared timezone service to normalise
 * timestamps retrieved from Google Sheets.
 */
function normaliseTimestamp(value, nowMs = Date.now()) {

  // Convert the incoming Google Sheets timestamp into UTC.
  const timestamp = normaliseAttendanceTimestamp(value);

  // Reject missing or invalid timestamps.
  if (!timestamp) {
    return null;
  }

  // Convert the timestamp into milliseconds.
  const timestampMs = Date.parse(timestamp);

  // Reject invalid dates and future attendance events.
  if (
    !Number.isFinite(timestampMs) ||
    timestampMs > nowMs
  ) {
    return null;
  }

  return timestamp;
}

// ============================================================
// 15. PROCESS EMPLOYEE CHECK-IN AND CHECK-OUT TIMESTAMPS
// ============================================================

/**
 * MAIN TIMESTAMP PROCESSING FUNCTION
 *
 * Receives employee records and clock event records.
 *
 * Identifies:
 * - The latest valid check-in timestamp.
 * - The latest valid check-out timestamp.
 *
 * WHY:
 * The dashboard needs the correct recorded timestamp
 * for each employee clock action.
 *
 * Future-dated and invalid events are rejected before
 * they can update the employee timestamp records.
 *
 * @param {Object} data
 * @param {Array} data.staff - Employee records.
 * @param {Array} data.clockEvents - Clock event records.
 * @returns {Array<Object>} Employee timestamp records.
 */
export function getAttendanceTimestamps({

  staff = [],

  clockEvents = [],

} = {}) {

  // Protect the service against unexpected input formats.
  const safeStaff = Array.isArray(staff) ? staff : [];

  const safeClockEvents = Array.isArray(clockEvents)
    ? clockEvents
    : [];

  // Capture the current time once for consistent validation.
  const nowMs = Date.now();

  // Store employee timestamp records using Firebase UIDs.
  const employeeTimestamps = new Map();


  /**
   * STEP 1: INITIALISE EMPLOYEE RECORDS
   *
   * Create one timestamp record per employee.
   *
   * WHY:
   * Employees should remain identifiable on the dashboard
   * even when they have no recorded clock events.
   */
  for (const employee of safeStaff) {

    const userId = normaliseIdentifier(
      employee.userId ?? employee.firebaseUid
    );

    // Ignore employee records without Firebase UIDs.
    if (!userId) {
      continue;
    }

    // Create the employee timestamp record.
    employeeTimestamps.set(userId, {

      userId,

      employeeId: employee.employeeId ?? "",

      name: String(employee.name ?? "").trim(),

      // Initialise the latest check-in timestamp.
      lastCheckInAt: null,

      // Initialise the latest check-out timestamp.
      lastCheckOutAt: null,

    });
  }


  /**
   * STEP 2: VALIDATE CLOCK EVENT RECORDS
   *
   * Validate:
   * - Firebase UID.
   * - Clock event type.
   * - Timestamp format.
   * - Timestamp validity against the current backend time.
   *
   * WHY:
   * Only valid historical clock events may update
   * the dashboard timestamp information.
   */
  const validEvents = safeClockEvents

    .map((event) => ({

      userId: normaliseIdentifier(
        event.userId ?? event.firebaseUid
      ),

      eventType: normaliseEventType(
        event.eventType ??
        event.event ??
        event.action
      ),

      timestamp: normaliseTimestamp(
        event.timestamp ?? event.createdAt,
        nowMs
      ),

    }))

    // Reject incomplete and invalid records.
    .filter(
      (event) =>
        event.userId &&
        event.eventType &&
        event.timestamp
    );


  /**
   * STEP 3: IDENTIFY THE LATEST VALID TIMESTAMPS
   *
   * Compare incoming timestamps against the previous
   * timestamp for the same employee and event type.
   *
   * WHY:
   * Spreadsheet row order cannot be trusted to represent
   * chronological order.
   *
   * Comparing actual timestamps ensures that older records
   * cannot replace more recent clock actions.
   */
  for (const event of validEvents) {

    // Match the event to its employee using Firebase UID.
    const employee = employeeTimestamps.get(event.userId);

    // Ignore events that do not match an employee.
    if (!employee) {
      continue;
    }

    // Convert the timestamp into milliseconds.
    const eventTime = Date.parse(event.timestamp);


    // PROCESS CHECK-IN TIMESTAMPS.
    if (event.eventType === "IN") {

      // Retrieve the previously stored check-in timestamp.
      const previousCheckIn = employee.lastCheckInAt
        ? Date.parse(employee.lastCheckInAt)
        : -Infinity;

      // Update only when the incoming timestamp is newer.
      if (eventTime > previousCheckIn) {
        employee.lastCheckInAt = event.timestamp;
      }
    }


    // PROCESS CHECK-OUT TIMESTAMPS.
    else if (event.eventType === "OUT") {

      // Retrieve the previously stored check-out timestamp.
      const previousCheckOut = employee.lastCheckOutAt
        ? Date.parse(employee.lastCheckOutAt)
        : -Infinity;

      // Update only when the incoming timestamp is newer.
      if (eventTime > previousCheckOut) {
        employee.lastCheckOutAt = event.timestamp;
      }
    }
  }


  /**
   * STEP 4: RETURN EMPLOYEE TIMESTAMP INFORMATION
   *
   * Convert the employee Map into an array.
   *
   * WHY:
   * Arrays of employee objects can be returned through
   * the backend API and consumed by the frontend.
   */
  return Array.from(employeeTimestamps.values());
}


// ============================================================
// 16. MAIN GOOGLE SHEETS ATTENDANCE FUNCTION
// ============================================================

/**
 * Main function called by the attendance controller.
 *
 * Performs the complete operation:
 * - Authenticate with Google Sheets.
 * - Retrieve all spreadsheet tabs.
 * - Identify the Users tab.
 * - Identify the Events tab.
 * - Prepare employee records.
 * - Prepare clock event records.
 * - Validate and process timestamps.
 * - Return the latest employee timestamps.
 *
 * WHY:
 * This keeps Google Sheets retrieval and timestamp processing
 * together inside the attendance service.
 *
 * @returns {Promise<Array<Object>>} Dashboard timestamp records.
 */
export async function getAttendanceTimestampsFromSheets() {

  try {

    // STEP 1: Retrieve the spreadsheet tabs.
    const sheetTables = await getAttendanceSheetTables();


    // STEP 2: Identify the Users tab by its required headings.
    const usersSheet = findSheetByHeaders(

      sheetTables,

      [
        "userIdFirebaseUid",
        "employeeId",
        "fullName",
      ],

      "Users"

    );


    // STEP 3: Identify the Events tab by its required headings.
    const eventsSheet = findSheetByHeaders(

      sheetTables,

    
[
  "eventId",
  "timestamp",
  "userIdFirebaseUid",
  "eventTypeClockInClockOut",
],


      "Events"

    );


    // STEP 4: Prepare employee information.
    const staff = mapStaffSheetValues(
      usersSheet.values
    );


    // STEP 5: Prepare clock event records.
    const clockEvents = mapClockEventSheetValues(
      eventsSheet.values
    );


    // STEP 6: Process timestamps and return the dashboard data.
    return getAttendanceTimestamps({

      staff,

      clockEvents,

    });

  } catch (error) {

    // Report the failure for backend debugging.
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


// ============================================================
// 17. FORMAT TIMESTAMPS FOR DASHBOARD DISPLAY
// ============================================================

/**
 * Format validated UTC timestamps for South African display.
 *
 * WHY:
 * The dashboard should display clock actions using
 * South African local time.
 *
 * The original stored UTC timestamps remain unchanged.
 *
 * Missing, invalid and future timestamps must not appear
 * as empty or misleading values.
 *
 * @param {string} timestamp - Recorded ISO timestamp.
 * @returns {string} Formatted dashboard timestamp.
 */
export function formatAttendanceTimestamp(timestamp) {

  // Handle missing timestamp values.
  if (!timestamp) {
    return "Not recorded";
  }

  // Validate the timestamp and reject future times.
  const validTimestamp = normaliseTimestamp(timestamp);

  // Never display an invalid or future-dated timestamp.
  if (!validTimestamp) {
    return "Not recorded";
  }

  // Convert the validated timestamp into South African time.
  return new Intl.DateTimeFormat("en-ZA", {

    dateStyle: "medium",

    timeStyle: "medium",

    timeZone: "Africa/Johannesburg",

  }).format(new Date(validTimestamp));
}