
/**
 * ============================================================
 * ATTENDANCE DATA PROVIDER
 * ============================================================
 *
 * PURPOSE:
 * - Read the Employees and Attendance tabs from Google Sheets.
 * - Retrieve both tabs using one batch read request.
 * - Match attendance events to employees using Employee ID.
 * - Retrieve Firebase UIDs from the Employees tab.
 * - Convert spreadsheet timestamps into UTC ISO timestamps.
 * - Calculate the number of active employees currently onsite.
 *
 * WHY THIS FILE EXISTS:
 * The attendance controller should not communicate directly
 * with Google Sheets or contain spreadsheet mapping logic.
 *
 * This provider handles the data retrieval and supplies the
 * controller with one structured result:
 *
 * {
 *   records: [...],
 *   totalIn: number
 * }
 *
 * GOOGLE SHEETS:
 * Employees tab:
 * User ID (Firebase UID)
 * Employee ID
 * Full Name
 * Email
 * Department
 * Role (Staff/Admin)
 * Status (Active/Inactive)
 *
 * Attendance tab:
 * Event ID
 * Timestamp
 * Employee ID
 * Event Type (Clock In/Clock Out)
 * Location
 * Comment
 */

// Google Sheets API client library.
import { google } from "googleapis";

// ============================================================
// 1. GOOGLE SHEETS CONFIGURATION
// ============================================================

/**
 * Returns the configuration needed to access Google Sheets.
 *
 * The tab names can be changed through .env without editing
 * this source file.
 */
function getConfiguration() {
  return {
    spreadsheetId: process.env.SPREADSHEET_ID,

    employeesTab:
      process.env.GOOGLE_SHEETS_EMPLOYEES_TAB || "Employees",

    attendanceTab:
      process.env.GOOGLE_SHEETS_ATTENDANCE_TAB || "Attendance",

    timezoneOffset:
      process.env.ATTENDANCE_TIME_ZONE_OFFSET || "+02:00",
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

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  // Google private keys stored in .env commonly contain literal
  // "\n" characters. Convert them into actual line breaks.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google Sheets service-account credentials are missing."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: GOOGLE_SHEETS_SCOPES,
  });

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
 * "User ID (Firebase UID)" -> "useridfirebaseuid"
 * "Employee ID"            -> "employeeid"
 * "Full Name"              -> "fullname"
 * "Status (Active/Inactive)" -> "status"
 * "Event Type (Clock In/Clock Out)" -> "eventtype"
 *
 * This makes the mapping less dependent on capitalisation
 * and descriptive text inside parentheses.
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
 */
function parseSheetRows(values, tabName) {
  if (!Array.isArray(values) || values.length === 0) {
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
 */
function getCell(row, index) {
  if (index < 0) {
    return "";
  }

  return String(row[index] ?? "").trim();
}

/**
 * Determines whether a spreadsheet row is completely empty.
 *
 * Empty trailing spreadsheet rows should not be processed
 * as employee or attendance records.
 */
function isEmptyRow(row) {
  return !row.some(
    (value) => String(value ?? "").trim() !== ""
  );
}

// ============================================================
// 3. TIMEZONE VALIDATION
// ============================================================

/**
 * Validates the timezone offset configured in .env.
 *
 * Examples:
 * +02:00
 * +01:00
 * -05:00
 *
 * South Africa uses +02:00.
 */
function validateTimezoneOffset(offset) {
  const match = String(offset).match(
    /^([+-])(\d{2}):(\d{2})$/
  );

  if (!match) {
    throw new Error(
      "ATTENDANCE_TIME_ZONE_OFFSET must use a format such as +02:00."
    );
  }

  const hours = Number(match[2]);
  const minutes = Number(match[3]);

  if (
    hours > 14 ||
    minutes > 59 ||
    (hours === 14 && minutes !== 0)
  ) {
    throw new Error(
      "ATTENDANCE_TIME_ZONE_OFFSET is outside the supported range."
    );
  }

  return offset;
}

// ============================================================
// 4. TIMESTAMP NORMALISATION
// ============================================================

/**
 * Converts a Google Sheets timestamp into a UTC ISO timestamp.
 *
 * WHY:
 * Google Sheets can return a local timestamp without a timezone.
 *
 * Example spreadsheet value:
 * 2026-11-17 08:00:00
 *
 * Configured office timezone:
 * +02:00
 *
 * Result:
 * 2026-11-17T06:00:00.000Z
 *
 * The timestamp represents the same moment, expressed in UTC.
 *
 * IMPORTANT:
 * We only add the timezone when the original timestamp does
 * not already contain one.
 */
function normaliseSheetTimestamp(value, timezoneOffset) {
  if (!value) {
    return null;
  }

  // A JavaScript Date already represents a specific moment.
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString();
  }

  if (typeof value !== "string") {
    return null;
  }

  const timestamp = value.trim();

  if (!timestamp) {
    return null;
  }

  // Check whether the timestamp already specifies UTC or an offset.
  const hasTimezone =
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(timestamp);

  if (hasTimezone) {
    // Convert a compact offset such as +0200 into +02:00.
    const formattedTimestamp = timestamp
      .replace(" ", "T")
      .replace(
        /([+-]\d{2})(\d{2})$/,
        "$1:$2"
      );

    const parsedDate = new Date(formattedTimestamp);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    // Do not accept clock events dated in the future.
    if (parsedDate.getTime() > Date.now()) {
      return null;
    }

    return parsedDate.toISOString();
  }

  // A timestamp without a timezone is interpreted using the
  // configured office timezone.
  const validOffset = validateTimezoneOffset(
    timezoneOffset
  );

  // Expected local spreadsheet format:
  // YYYY-MM-DD HH:mm:ss
  //
  // Optional seconds and fractional seconds are also accepted.
  const match = timestamp.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  );

  if (!match) {
    return null;
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second = "00",
    milliseconds = "",
  ] = match;

  // Validate the actual calendar date and clock time.
  const dateParts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };

  const daysInMonth =
    dateParts.month >= 1 && dateParts.month <= 12
      ? new Date(
          Date.UTC(
            dateParts.year,
            dateParts.month,
            0
          )
        ).getUTCDate()
      : 0;

  const validLocalDateTime =
    dateParts.day >= 1 &&
    dateParts.day <= daysInMonth &&
    dateParts.hour >= 0 &&
    dateParts.hour <= 23 &&
    dateParts.minute >= 0 &&
    dateParts.minute <= 59 &&
    dateParts.second >= 0 &&
    dateParts.second <= 59;

  if (!validLocalDateTime) {
    return null;
  }

  // Keep fractional seconds when present.
  const formattedMilliseconds = milliseconds.padEnd(3, "0");

  // Add the configured timezone to the local spreadsheet value.
  const timestampWithTimezone =
    `${year}-${month}-${day}` +
    `T${hour}:${minute}:${second}` +
    `.${formattedMilliseconds}` +
    validOffset;

  const parsedDate = new Date(timestampWithTimezone);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  // Reject future events.
  if (parsedDate.getTime() > Date.now()) {
    return null;
  }

  // The controller receives a consistent UTC timestamp.
  return parsedDate.toISOString();
}

// ============================================================
// 5. ATTENDANCE EVENT NORMALISATION
// ============================================================

/**
 * Converts supported event labels into standard event types.
 *
 * Supported values:
 * Clock In
 * Clock Out
 *
 * The returned values are used internally for calculations.
 */
function normaliseEventType(value) {
  const eventType = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (eventType === "clock in") {
    return "IN";
  }

  if (eventType === "clock out") {
    return "OUT";
  }

  return null;
}

// ============================================================
// 6. EMPLOYEE LOOKUP
// ============================================================

/**
 * Builds a lookup of employees using Employee ID as the key.
 *
 * WHY EMPLOYEE ID:
 * The Attendance tab does not need to store Firebase UIDs.
 * It only needs the employee's unique Employee ID.
 *
 * The Firebase UID and employee information are retrieved
 * from the Employees tab.
 *
 * IMPORTANT:
 * Each Employee ID must be unique.
 */
function buildEmployeeLookup(
  employeeRows,
  headers,
  tabName
) {
  const uidColumn = findColumn(
    headers,
    [
      "User ID (Firebase UID)",
      "Firebase UID",
      "User ID",
      "UID",
    ],
    "Firebase User ID",
    tabName,
    false
  );

  const employeeIdColumn = findColumn(
    headers,
    ["Employee ID", "Staff ID"],
    "Employee ID",
    tabName
  );

  const nameColumn = findColumn(
    headers,
    ["Full Name", "Name"],
    "Full Name",
    tabName
  );

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

  const employeesById = new Map();

  // Tracks duplicate Firebase UIDs without using them as
  // the attendance matching key.
  const employeeIdsByUid = new Map();

  for (const row of employeeRows) {
    if (isEmptyRow(row)) {
      continue;
    }

    const employeeId = getCell(
      row,
      employeeIdColumn
    );

    const name = getCell(
      row,
      nameColumn
    );

    const userId = getCell(
      row,
      uidColumn
    );

    const status = getCell(
      row,
      statusColumn
    ).toLowerCase();

    // Non-empty employee rows must have an Employee ID and name.
    if (!employeeId || !name) {
      throw new Error(
        "An Employees row is missing its Employee ID or Full Name."
      );
    }

    // Employee IDs must uniquely identify employees.
    if (employeesById.has(employeeId)) {
      throw new Error(
        `The Employees tab contains a duplicate Employee ID: ${employeeId}.`
      );
    }

    const employee = {
      userId,
      employeeId,
      name,
      active: status === "active",
    };

    employeesById.set(employeeId, employee);

    // Duplicate Firebase UIDs do not merge employee records here.
    // Employee ID remains the unique attendance matching key.
    if (userId) {
      const existingEmployeeId =
        employeeIdsByUid.get(userId);

      if (
        existingEmployeeId &&
        existingEmployeeId !== employeeId
      ) {
        console.warn(
          "[ATTENDANCE DATA WARNING] Multiple Employee IDs " +
          "are assigned to the same Firebase UID."
        );
      } else {
        employeeIdsByUid.set(userId, employeeId);
      }
    }
  }

  return employeesById;
}

// ============================================================
// 7. ATTENDANCE RECORD CALCULATION
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
 * Both events have the same timestamp.
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

/**
 * Processes Attendance rows and connects them to Employees.
 *
 * Each attendance event is matched using Employee ID.
 *
 * The service keeps the latest check-in and latest check-out
 * timestamp for each employee.
 */
function processAttendanceEvents({
  attendanceRows,
  headers,
  employeesById,
  attendanceTab,
  timezoneOffset,
}) {
  const eventIdColumn = findColumn(
    headers,
    ["Event ID", "Attendance Event ID", "Log ID"],
    "Event ID",
    attendanceTab,
    false
  );

  const timestampColumn = findColumn(
    headers,
    ["Timestamp", "Event Timestamp", "Date and Time"],
    "Timestamp",
    attendanceTab
  );

  const employeeIdColumn = findColumn(
    headers,
    ["Employee ID", "Staff ID"],
    "Employee ID",
    attendanceTab
  );

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

    // Read the event columns.
    // Event ID is retained for diagnostics but is not used
    // to identify an employee.
    const eventId = getCell(
      row,
      eventIdColumn
    );

    const employeeId = getCell(
      row,
      employeeIdColumn
    );

    const rawTimestamp = getCell(
      row,
      timestampColumn
    );

    const rawEventType = getCell(
      row,
      eventTypeColumn
    );

    // Find the employee using the shared Employee ID.
    const employee = employeesById.get(employeeId);

    if (!employee) {
      unmatchedEvents++;
      continue;
    }

    // Convert the timestamp using the office timezone.
    const timestamp = normaliseSheetTimestamp(
      rawTimestamp,
      timezoneOffset
    );

    // Convert Clock In / Clock Out into a standard value.
    const eventType = normaliseEventType(
      rawEventType
    );

    // Events without a valid timestamp or event type cannot
    // safely influence employee attendance status.
    if (!timestamp || !eventType) {
      invalidEvents++;

      // eventId is intentionally not logged because it may
      // identify an individual attendance event.
      continue;
    }

    // Retrieve the employee's existing attendance summary.
    let record = recordsByEmployee.get(employeeId);

    if (!record) {
      record = {
        userId: employee.userId,
        employeeId: employee.employeeId,
        name: employee.name,
        active: employee.active,
        lastCheckInAt: null,
        lastCheckOutAt: null,
      };

      recordsByEmployee.set(employeeId, record);
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
  if (populatedRows > 0 && validEvents === 0) {
    throw new Error(
      "No valid attendance events could be processed. " +
      "Check Employee ID matching, timestamp format and event types."
    );
  }

  // Some invalid or unmatched rows may exist alongside valid events.
  // Log counts without exposing employee identities.
  if (unmatchedEvents > 0 || invalidEvents > 0) {
    console.warn(
      "[ATTENDANCE DATA WARNING]",
      `${unmatchedEvents} unmatched events and ` +
      `${invalidEvents} invalid events were ignored.`
    );
  }

  // Convert the map into the employee record array.
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
  // Employee ID is the Map key, so duplicated Firebase UIDs
  // will not cause two distinct employee records to collapse.
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
 * IMPORTANT PERFORMANCE CHANGE:
 *
 * Both tabs are retrieved using one Google Sheets batchGet call.
 *
 * Previously:
 * - attendanceService.js independently read the spreadsheet.
 * - onsiteService.js independently read the spreadsheet.
 *
 * Now:
 * - One request retrieves both tabs.
 * - Both the employee timestamps and onsite total use the same
 *   spreadsheet snapshot.
 * - Fewer Google Sheets API requests are generated.
 */
export async function getLiveAttendanceData() {
  try {
    const config = getConfiguration();

    if (!config.spreadsheetId) {
      throw new Error(
        "SPREADSHEET_ID is missing from the backend environment."
      );
    }

    // Validate the timezone before retrieving records.
    const timezoneOffset = validateTimezoneOffset(
      config.timezoneOffset
    );

    // Get the reusable Google Sheets API client.
    const sheets = getSheetsClient();

    // Prepare both tab ranges.
    const employeesRange =
      `${quoteTabName(config.employeesTab)}!A:Z`;

    const attendanceRange =
      `${quoteTabName(config.attendanceTab)}!A:Z`;

    // Retrieve both tabs together.
    //
    // FORMATTED_VALUE makes the returned timestamp strings
    // follow the format displayed in the spreadsheet.
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: config.spreadsheetId,

      ranges: [
        employeesRange,
        attendanceRange,
      ],

      valueRenderOption: "FORMATTED_VALUE",
    });

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

    // Build the employee lookup using Employee ID.
    const employeesById = buildEmployeeLookup(
      employeesSheet.rows,
      employeesSheet.headers,
      config.employeesTab
    );

    if (employeesById.size === 0) {
      throw new Error(
        "No employee records were found in the Employees tab."
      );
    }

    // Calculate attendance records and onsite count from
    // the same batch-read snapshot.
    const result = processAttendanceEvents({
      attendanceRows: attendanceSheet.rows,
      headers: attendanceSheet.headers,
      employeesById,
      attendanceTab: config.attendanceTab,
      timezoneOffset,
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

// Support named and default imports.
export default getLiveAttendanceData;
