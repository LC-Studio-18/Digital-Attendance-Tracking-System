
/**
 * ============================================================
 * TIMEZONE UTILITIES
 * ============================================================
 *
 * PURPOSE:
 * - Standardise attendance timestamps.
 * - Handle timestamps retrieved from Google Sheets.
 * - Convert South African local timestamps into UTC.
 * - Format timestamps for South African users.
 *
 * TIMEZONE CONFIGURATION:
 * - Application timezone: Africa/Johannesburg
 * - South African timezone: SAST (UTC+2)
 *
 * IMPORTANT:
 * The backend stores timestamps in UTC.
 * The frontend can display them in South African time.
 *
 * This prevents incorrect timestamps when the backend,
 * Google Sheets and frontend use different timezones.
 */

// ============================================================
// 1. TIMEZONE CONSTANTS
// ============================================================

export const ATTENDANCE_TIME_ZONE = "Africa/Johannesburg";

// South African Standard Time is UTC+02:00.
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

// Google Sheets uses 30 December 1899 as its date serial epoch.
const GOOGLE_SHEETS_EPOCH = Date.UTC(1899, 11, 30);

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;


// ============================================================
// 2. PARSE ATTENDANCE TIMESTAMPS
// ============================================================

/**
 * Converts an incoming attendance timestamp into a
 * valid JavaScript Date object.
 *
 * Supports:
 * 1. JavaScript Date objects.
 * 2. Google Sheets numeric date serials.
 * 3. ISO timestamps with an explicit timezone.
 * 4. ISO timestamps without a timezone.
 *
 * Timestamps without a timezone are assumed to represent
 * South African local time.
 *
 * @param {string|number|Date} value
 * @returns {Date|null}
 */
export function parseAttendanceTimestamp(value) {

  // Reject missing values.
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  let date;

  // ----------------------------------------------------------
  // Handle existing JavaScript Date objects.
  // ----------------------------------------------------------

  if (value instanceof Date) {
    date = value;
  }

  // ----------------------------------------------------------
  // Handle Google Sheets numeric date serials.
  // ----------------------------------------------------------

  else if (typeof value === "number") {

    // Reject invalid or unrealistic spreadsheet values.
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100000
    ) {
      return null;
    }

    // Convert the Google Sheets date serial into milliseconds.
    //
    // The spreadsheet date represents local South African time.
    // Subtract two hours to obtain the corresponding UTC instant.

    date = new Date(
      GOOGLE_SHEETS_EPOCH +
      Math.round(value * MILLISECONDS_PER_DAY) -
      SAST_OFFSET_MS
    );
  }

  // ----------------------------------------------------------
  // Handle timestamp strings.
  // ----------------------------------------------------------

  else if (typeof value === "string") {

    const timestamp = value.trim().replace(" ", "T");

    // Only accept ISO-style date and time strings.
    const isoDateTimePattern =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/i;

    if (!isoDateTimePattern.test(timestamp)) {
      return null;
    }

    // Check whether the timestamp already specifies a timezone.
    const hasTimezone =
      /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp);

    // An explicit timezone is preserved.
    //
    // Without one, assume the timestamp represents SAST.
    const normalisedTimestamp = hasTimezone
      ? timestamp
      : `${timestamp}+02:00`;

    date = new Date(normalisedTimestamp);
  }

  else {
    return null;
  }

  // Reject invalid JavaScript dates.
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return date;
}


// ============================================================
// 3. NORMALISE TIMESTAMPS TO UTC
// ============================================================

/**
 * Converts an attendance timestamp into ISO 8601 UTC format.
 *
 * Example:
 *
 * South African time:
 * 2026-11-20T08:10:00+02:00
 *
 * Stored UTC time:
 * 2026-11-20T06:10:00.000Z
 *
 * This gives every attendance record one consistent format.
 *
 * @param {string|number|Date} value
 * @returns {string|null}
 */
export function normaliseAttendanceTimestamp(value) {

  const date = parseAttendanceTimestamp(value);

  if (!date) {
    return null;
  }

  return date.toISOString();
}


// ============================================================
// 4. FORMAT TIMESTAMPS FOR SOUTH AFRICAN USERS
// ============================================================

/**
 * Formats an attendance timestamp using South African time.
 *
 * IMPORTANT:
 * This function is for displaying timestamps.
 * It does not change the original stored UTC timestamp.
 *
 * Example:
 * 2026-11-20T06:10:00.000Z
 *
 * Display:
 * 20/11/2026, 08:10:00
 *
 * @param {string|number|Date} value
 * @returns {string|null}
 */
export function formatSouthAfricanTimestamp(value) {

  const date = parseAttendanceTimestamp(value);

  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: ATTENDANCE_TIME_ZONE,

    day: "2-digit",
    month: "2-digit",
    year: "numeric",

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",

    hourCycle: "h23",
  }).format(date);
}


// ============================================================
// 5. GENERATE CURRENT SERVER TIMESTAMP
// ============================================================

/**
 * Generates the current server timestamp in UTC.
 *
 * JavaScript Date stores the actual instant independently
 * of the machine's configured timezone.
 *
 * @returns {string}
 */
export function getCurrentUtcTimestamp() {
  return new Date().toISOString();
}