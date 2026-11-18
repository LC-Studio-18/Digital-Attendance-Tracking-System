
/**
 * ============================================================
 * ATTENDANCE TIMESTAMP SERVICE
 * ============================================================
 *
 * PURPOSE:
 * - Authenticate directly with Google Sheets.
 * - Retrieve the Users and Events spreadsheet tabs.
 * - Identify each tab using its column headings.
 * - Convert spreadsheet records into JavaScript objects.
 * - Match Firebase user IDs to clock event records.
 * - Validate clock event types and timestamps.
 * - Identify the latest check-in timestamp per employee.
 * - Identify the latest check-out timestamp per employee.
 * - Return timestamp information for dashboard display.
 *
 * IMPORTANT:
 * This service handles its own Google Sheets connection.
 * It does not depend on a separate spreadsheet integration service.
 *
 * SCOPE:
 * This service ONLY handles check-in and check-out timestamps.
 * It does not calculate employee attendance status or totals.
 */


// ============================================================
// 1. IMPORT DEPENDENCIES
// ============================================================

// Google API library for accessing Google Sheets.
import { google } from "googleapis";

// Load backend environment variables.
import dotenv from "dotenv";

// Resolve the shared backend environment file.
import { fileURLToPath } from "node:url";

// Validate and prepare the Google RSA private key.
import { createPrivateKey } from "node:crypto";


// ============================================================
// 2. LOAD SHARED ENVIRONMENT VARIABLES
// ============================================================

/**
 * Resolve the shared backend .env file.
 *
 * WHY:
 * The service needs access to the existing Google service
 * account credentials and spreadsheet configuration.
 */
const ENV_PATH = fileURLToPath(
  new URL("../../.env", import.meta.url)
);

// Load the shared environment variables.
dotenv.config({
  path: ENV_PATH,
  override: false,
});


// ============================================================
// 3. CLEAN ENVIRONMENT VALUES
// ============================================================

/**
 * Remove whitespace and surrounding quotation marks.
 *
 * WHY:
 * Environment variables may contain quotation marks
 * that should not be included in API requests.
 */
function cleanEnvValue(value) {

  return String(value ?? "")
    .trim()
    .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "");
}


// ============================================================
// 4. NORMALISE GOOGLE PRIVATE KEY
// ============================================================

/**
 * Prepare and validate the Google service account private key.
 *
 * WHY:
 * Google authentication requires a correctly formatted
 * RSA private key.
 *
 * This function:
 * - Removes surrounding quotation marks.
 * - Restores escaped newline characters.
 * - Restores missing PEM boundaries when necessary.
 * - Checks that Node.js can decode the private key.
 * - Returns a consistent PKCS#8 PEM key.
 *
 * The private key is never returned to the frontend.
 */
function normalisePrivateKey(value) {

  let key = cleanEnvValue(value)
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!key) {
    throw new Error("Google private key is missing.");
  }

  // Restore the PEM boundaries when only the Base64
  // private key content is supplied.
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

    // Google service account keys should use RSA.
    if (parsedKey.asymmetricKeyType !== "rsa") {
      throw new Error("The private key must use RSA.");
    }

    // Export a consistent PKCS#8 PEM representation.
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
 * Create an authenticated Google Sheets API client.
 *
 * Uses the existing shared environment variables:
 *
 * GOOGLE_CLIENT_EMAIL
 * GOOGLE_PRIVATE_KEY
 *
 * WHY:
 * The backend needs authorised access to retrieve
 * the spreadsheet records.
 *
 * JWT authentication avoids the deprecated GoogleAuth
 * credentials configuration.
 *
 * Read-only access prevents this service from modifying
 * the spreadsheet.
 */
async function getGoogleSheetsClient() {

  // Retrieve the Google service account email.
  const clientEmail = cleanEnvValue(
    process.env.GOOGLE_CLIENT_EMAIL
  );

  // Retrieve and validate the private key.
  const privateKey = normalisePrivateKey(
    process.env.GOOGLE_PRIVATE_KEY
  );

  // Stop authentication if the email is missing.
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

  // Complete authentication before accessing the spreadsheet.
  await auth.authorize();

  // Return the authenticated Google Sheets API client.
  return google.sheets({
    version: "v4",
    auth,
  });
}


// ============================================================
// 6. RETRIEVE ALL SPREADSHEET TABS
// ============================================================

/**
 * Retrieve the available tabs and their spreadsheet records.
 *
 * Uses the existing environment variable:
 *
 * SPREADSHEET_ID
 *
 * WHY:
 * The attendance system stores employee information
 * and clock events in separate spreadsheet tabs.
 *
 * Rather than assuming tab names, this function retrieves
 * the spreadsheet metadata and identifies every available tab.
 *
 * Each tab is retrieved independently so that the service
 * can identify the correct employee and event structures.
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

  // Retrieve the spreadsheet's tab information.
  const spreadsheetInfo = await sheets.spreadsheets.get({

    spreadsheetId,

    fields: "sheets.properties(sheetId,title)",

  });

  // Retrieve the available spreadsheet tabs.
  const sheetProperties = (
    spreadsheetInfo.data.sheets ?? []
  )
    .map((sheet) => sheet.properties)
    .filter((properties) => properties?.title);


  // Stop if the spreadsheet has no available tabs.
  if (sheetProperties.length === 0) {
    throw new Error(
      "No spreadsheet tabs were found."
    );
  }

  /**
   * Convert each tab name into a valid Google Sheets range.
   *
   * Tab names are quoted so that spaces and special
   * characters do not interfere with range interpretation.
   */
  const ranges = sheetProperties.map(({ title }) => {

    // Escape apostrophes within the tab name.
    const escapedTitle = title.replace(/'/g, "''");

    // Retrieve all rows across columns A through Z.
    return `'${escapedTitle}'!A:Z`;
  });


  /**
   * Retrieve every tab in one batch request.
   *
   * WHY:
   * Batch retrieval reduces unnecessary API requests and
   * allows the service to compare the different tab structures.
   */
  const response = await sheets.spreadsheets.values.batchGet({

    spreadsheetId,

    ranges,

    majorDimension: "ROWS",

    // Retrieve stored values rather than visual formatting.
    valueRenderOption: "UNFORMATTED_VALUE",

  });


  // Associate each retrieved range with its tab name.
  return sheetProperties.map((properties, index) => ({

    sheetId: properties.sheetId,

    title: properties.title,

    // Empty spreadsheet tabs return an empty array.
    values:
      response.data.valueRanges?.[index]?.values ?? [],

  }));
}


/**
 * ============================================================
 * 7. NORMALISE GOOGLE SHEETS HEADERS
 * ============================================================
 *
 * Converts spreadsheet headings into consistent
 * JavaScript property names.
 *
 * WHY:
 * The service needs consistent property names to identify
 * the Users and Events spreadsheet structures.
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
 * 8. CONVERT SPREADSHEET ROWS INTO OBJECTS
 * ============================================================
 *
 * Converts spreadsheet rows into JavaScript objects.
 *
 * The first row is used as the column heading row.
 *
 * WHY:
 * Objects allow the service to retrieve employee and clock
 * event information using consistent property names.
 *
 * @param {Array} values - Raw spreadsheet rows.
 * @returns {Array<Object>} Converted records.
 */
export function mapSheetRowsToObjects(values = []) {

  // Ensure the spreadsheet contains headings and records.
  if (!Array.isArray(values) || values.length < 2) {
    return [];
  }

  // Separate column headings from the remaining rows.
  const [headers, ...rows] = values;

  if (!Array.isArray(headers)) {
    return [];
  }

  // Standardise each spreadsheet heading.
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

      // Create an object for the current spreadsheet record.
      const record = {};

      // Match each spreadsheet value to its column heading.
      normalisedHeaders.forEach((header, index) => {

        // Ignore columns without a valid heading.
        if (!header) return;

        record[header] = row[index] ?? "";
      });

      return record;
    });
}


// ============================================================
// 9. IDENTIFY THE USERS AND EVENTS TABS
// ============================================================

/**
 * Identify a spreadsheet tab using its required headings.
 *
 * WHY:
 * The service should not depend on a particular tab name.
 * It identifies the correct tab by checking its structure.
 *
 * @param {Array} sheetTables - Retrieved spreadsheet tabs.
 * @param {Array} requiredHeaders - Required column names.
 * @param {string} description - Description for error reporting.
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

    // Normalise the first row of the spreadsheet tab.
    const headers = sheet.values[0].map(normaliseHeader);

    // Check whether every required column exists.
    return requiredHeaders.every((requiredHeader) =>
      headers.includes(requiredHeader)
    );
  });

  // Report a useful error when no matching tab exists.
  if (!matchingSheet) {
    throw new Error(
      `Unable to find the ${description} spreadsheet tab. ` +
      `Check that its required column headings are present.`
    );
  }

  return matchingSheet;
}


/**
 * ============================================================
 * 10. NORMALISE EMPLOYEE IDENTIFIERS
 * ============================================================
 *
 * Standardises Firebase user IDs and employee identifiers.
 *
 * WHY:
 * The Users tab identifies people using Firebase UIDs.
 * The Events tab also stores Firebase UIDs.
 *
 * Using the Firebase UID ensures the correct user is
 * associated with each clock event.
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
 * EXPECTED STRUCTURE:
 *
 * User ID (Firebase UID)
 * Employee ID
 * Full Name
 * Email
 * Department
 * Role (Staff/Admin)
 * Status (Active/Inactive)
 *
 * WHY:
 * This information identifies each employee and provides
 * the Firebase UID required to match clock event records.
 *
 * @param {Array} values - Users spreadsheet rows.
 * @returns {Array<Object>} Prepared employee records.
 */
export function mapStaffSheetValues(values = []) {

  const rows = mapSheetRowsToObjects(values);

  const employees = new Map();

  for (const row of rows) {

    // Retrieve the Firebase UID from the Users tab.
    const userId = normaliseIdentifier(
      row.userIdFirebaseUid ??
      row.firebaseUid ??
      row.userId ??
      row.uid
    );

    // A Firebase UID is required to match clock events.
    if (!userId) {
      continue;
    }

    // Preserve an existing employee name if necessary.
    const existing = employees.get(userId);

    // Store the employee information.
    employees.set(userId, {

      userId,

      // Retain the organisation's employee identifier.
      employeeId: normaliseIdentifier(row.employeeId),

      // Retrieve the employee's full name.
      name: String(
        row.fullName ??
        row.name ??
        existing?.name ??
        ""
      ).trim(),

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
 * EXPECTED STRUCTURE:
 *
 * Event ID
 * Timestamp
 * User ID
 * Event Type (Clock In/Clock Out)
 * Location
 * Comment
 *
 * WHY:
 * This function extracts the Firebase UID, event type
 * and timestamp needed to process employee clock actions.
 *
 * Location and Comment are not needed for this timestamp
 * requirement and are therefore not processed.
 *
 * @param {Array} values - Events spreadsheet rows.
 * @returns {Array<Object>} Prepared clock event records.
 */
export function mapClockEventSheetValues(values = []) {

  const rows = mapSheetRowsToObjects(values);

  return rows.map((row) => ({

    // Retrieve the unique clock event identifier.
    eventId: row.eventId ?? "",

    // Retrieve the recorded Firebase UID.
    userId: row.userId ?? row.userIdFirebaseUid ?? "",

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
 * Convert clock event descriptions into consistent values.
 *
 * WHY:
 * The service must distinguish check-in events from
 * check-out events before updating employee timestamps.
 *
 * Unrecognised event types are rejected.
 */
function normaliseEventType(value) {

  const event = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  // Recognise clock-in events.
  if (["CLOCKIN", "CHECKIN", "IN"].includes(event)) {
    return "IN";
  }

  // Recognise clock-out events.
  if (["CLOCKOUT", "CHECKOUT", "OUT"].includes(event)) {
    return "OUT";
  }

  return null;
}


// ============================================================
// 14. VALIDATE AND NORMALISE TIMESTAMPS
// ============================================================

/**
 * Validate incoming clock timestamps.
 *
 * Requires an ISO 8601 timestamp containing explicit
 * timezone information.
 *
 * WHY:
 * Standardising timestamps prevents differences between
 * Google Sheets, the backend and dashboard.
 *
 * Invalid timestamps are rejected.
 *
 * IMPORTANT:
 * The Events Timestamp column should be stored as plain text
 * containing ISO timestamps with timezone information.
 * Google Sheets date serial values are not accepted here
 * because their timezone cannot safely be inferred.
 *
 * @param {string|Date} value - Incoming timestamp.
 * @returns {string|null} Standardised UTC timestamp.
 */
function normaliseTimestamp(value) {

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

  // Only accept string timestamps.
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = value.trim();

  // Require an explicit timezone in ISO 8601 format.
  const validISOFormat =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

  if (!validISOFormat.test(timestamp)) {
    return null;
  }

  // Convert the timestamp to a JavaScript Date object.
  const date = new Date(timestamp);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  // Store and return the timestamp in UTC.
  return date.toISOString();
}


// ============================================================
// 15. IDENTIFY LATEST EMPLOYEE TIMESTAMPS
// ============================================================

/**
 * MAIN PROCESSING FUNCTION
 *
 * Receives employee records and clock event records.
 *
 * Identifies:
 * - Latest valid clock-in timestamp.
 * - Latest valid clock-out timestamp.
 *
 * WHY:
 * The dashboard requires accurate timestamps for each
 * employee's clock actions.
 *
 * The Firebase UID is used to match Users records to Events.
 *
 * This function does not calculate attendance status
 * or workforce totals.
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

  // Protect the function against unexpected input types.
  const safeStaff = Array.isArray(staff) ? staff : [];

  const safeClockEvents = Array.isArray(clockEvents)
    ? clockEvents
    : [];

  // Store employee timestamps using Firebase UIDs.
  const employeeTimestamps = new Map();


  /**
   * STEP 1: INITIALISE EMPLOYEE RECORDS
   *
   * Create one timestamp record for each user.
   *
   * WHY:
   * This ensures employees remain identifiable even when
   * they have no recorded clock events.
   */
  for (const employee of safeStaff) {

    const userId = normaliseIdentifier(
      employee.userId ??
      employee.firebaseUid
    );

    // Ignore employee records without Firebase UIDs.
    if (!userId) {
      continue;
    }

    // Create the employee's timestamp record.
    employeeTimestamps.set(userId, {

      userId,

      employeeId: employee.employeeId ?? "",

      name: employee.name ?? "",

      // Latest clock-in timestamp.
      lastCheckInAt: null,

      // Latest clock-out timestamp.
      lastCheckOutAt: null,

    });
  }


  /**
   * STEP 2: VALIDATE CLOCK EVENTS
   *
   * Validate user IDs, event types and timestamps.
   *
   * WHY:
   * Incomplete or invalid records must not update
   * dashboard timestamp information.
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
        event.timestamp ?? event.createdAt
      ),

    }))

    // Keep only records with valid event information.
    .filter(
      (event) =>
        event.userId &&
        event.eventType &&
        event.timestamp
    );


  /**
   * STEP 3: MATCH EVENTS TO EMPLOYEES AND FIND LATEST TIMES
   *
   * Compare each valid event with the previously recorded
   * timestamp for the same employee.
   *
   * WHY:
   * Spreadsheet rows may not be arranged chronologically.
   * Comparing timestamp values ensures that older events
   * cannot replace more recent clock actions.
   */
  for (const event of validEvents) {

    // Find the employee using the Firebase UID.
    const employee = employeeTimestamps.get(event.userId);

    // Ignore events that do not match a user record.
    if (!employee) {
      continue;
    }

    // Convert the timestamp into milliseconds for comparison.
    const eventTime = Date.parse(event.timestamp);


    // PROCESS CHECK-IN TIMESTAMPS.
    if (event.eventType === "IN") {

      const previousCheckIn = employee.lastCheckInAt
        ? Date.parse(employee.lastCheckInAt)
        : -Infinity;

      // Keep the latest recorded check-in timestamp.
      if (eventTime > previousCheckIn) {
        employee.lastCheckInAt = event.timestamp;
      }
    }


    // PROCESS CHECK-OUT TIMESTAMPS.
    else if (event.eventType === "OUT") {

      const previousCheckOut = employee.lastCheckOutAt
        ? Date.parse(employee.lastCheckOutAt)
        : -Infinity;

      // Keep the latest recorded check-out timestamp.
      if (eventTime > previousCheckOut) {
        employee.lastCheckOutAt = event.timestamp;
      }
    }
  }


  /**
   * STEP 4: RETURN DASHBOARD TIMESTAMP INFORMATION
   *
   * Convert the Map into an array of employee records.
   *
   * WHY:
   * The frontend can iterate through the returned employee
   * records and display their latest timestamps.
   */
  return Array.from(employeeTimestamps.values());
}


// ============================================================
// 16. MAIN GOOGLE SHEETS ATTENDANCE FUNCTION
// ============================================================

/**
 * This is the main function called by the backend controller.
 *
 * It performs the complete process:
 *
 * - Authenticates with Google Sheets.
 * - Retrieves all available spreadsheet tabs.
 * - Identifies the Users tab from its column headings.
 * - Identifies the Events tab from its column headings.
 * - Converts both tables into JavaScript objects.
 * - Matches Firebase UIDs between the two tables.
 * - Processes and validates clock timestamps.
 * - Returns the latest timestamps for dashboard display.
 *
 * WHY:
 * This keeps the entire Google Sheets retrieval and
 * timestamp processing operation inside this service.
 *
 * @returns {Promise<Array<Object>>} Dashboard timestamp records.
 */
export async function getAttendanceTimestampsFromSheets() {

  try {

    // STEP 1: Retrieve every spreadsheet tab.
    const sheetTables = await getAttendanceSheetTables();


    /**
     * STEP 2: Identify the Users tab.
     *
     * The service checks the actual column headings rather
     * than relying on a particular tab name.
     */
    const usersSheet = findSheetByHeaders(

      sheetTables,

      [
        "userIdFirebaseUid",
        "employeeId",
        "fullName",
      ],

      "Users"

    );


    /**
     * STEP 3: Identify the Events tab.
     *
     * The service finds the event history using its
     * required event ID, timestamp, user ID and event type.
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


    // STEP 4: Prepare employee records from the Users tab.
    const staff = mapStaffSheetValues(
      usersSheet.values
    );


    // STEP 5: Prepare clock events from the Events tab.
    const clockEvents = mapClockEventSheetValues(
      eventsSheet.values
    );


    // STEP 6: Process and return employee timestamps.
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

    // Pass the failure to the backend controller.
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
 * The dashboard should display the clock action in
 * South African local time while the original stored
 * timestamp remains in UTC.
 *
 * @param {string} timestamp - Validated ISO timestamp.
 * @returns {string} Formatted dashboard timestamp.
 */
export function formatAttendanceTimestamp(timestamp) {

  // Handle employees without a recorded clock action.
  if (!timestamp) {
    return "Not recorded";
  }

  // Validate and standardise the incoming timestamp.
  const validTimestamp = normaliseTimestamp(timestamp);

  if (!validTimestamp) {
    return "Invalid timestamp";
  }

  // Format using the South African timezone.
  return new Intl.DateTimeFormat("en-ZA", {

    dateStyle: "medium",

    timeStyle: "medium",

    timeZone: "Africa/Johannesburg",

  }).format(new Date(validTimestamp));
}
