
/**
 * ============================================================
 * TIMEZONE SERVICE TESTS
 * ============================================================
 *
 * FILE LOCATION:
 * backend/test/timezone.test.js
 *
 * PURPOSE:
 * - Verify timezone-free Google Sheets timestamps.
 * - Verify Google Sheets numeric date serial conversion.
 * - Verify UTC timestamps are not shifted twice.
 * - Verify South African timestamp formatting.
 * - Verify invalid timestamps are rejected.
 *
 * RUN FROM THE BACKEND DIRECTORY:
 * node --test test/timezone.test.js
 *
 * These tests do not connect to Google Sheets.
 * They test the timezone utility using representative values.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  ATTENDANCE_TIME_ZONE,
  parseAttendanceTimestamp,
  normaliseAttendanceTimestamp,
  formatSouthAfricanTimestamp,
  getCurrentUtcTimestamp,
} from "../src/services/timezone.js";


// ============================================================
// 1. TEST DATA HELPERS
// ============================================================

/**
 * Converts a South African wall-clock date/time into a
 * Google Sheets serial number.
 *
 * Google Sheets counts days from 30 December 1899.
 *
 * The resulting number represents the local date/time shown
 * in a spreadsheet configured for Africa/Johannesburg.
 */
function makeSouthAfricanSheetsSerial({
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
}) {
  const sheetsEpoch = Date.UTC(1899, 11, 30);

  const localWallClock = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
  );

  return (
    (localWallClock - sheetsEpoch) /
    (24 * 60 * 60 * 1000)
  );
}


// ============================================================
// 2. TIMEZONE CONFIGURATION TEST
// ============================================================

test("uses the South African IANA timezone", () => {
  assert.equal(
    ATTENDANCE_TIME_ZONE,
    "Africa/Johannesburg",
  );
});


// ============================================================
// 3. TIMEZONE-FREE GOOGLE SHEETS TIMESTAMPS
// ============================================================

test("interprets a timezone-free Sheets timestamp as SAST", () => {
  const result = normaliseAttendanceTimestamp(
    "2026-11-20T08:10:00",
  );

  // 08:10 South African time = 06:10 UTC.

  assert.equal(
    result,
    "2026-11-20T06:10:00.000Z",
  );
});


test("interprets a Sheets timestamp with a space separator as SAST", () => {
  const result = normaliseAttendanceTimestamp(
    "2026-11-20 08:10:00",
  );

  assert.equal(
    result,
    "2026-11-20T06:10:00.000Z",
  );
});


// ============================================================
// 4. GOOGLE SHEETS NUMERIC DATE SERIAL TESTS
// ============================================================

test("converts a Google Sheets numeric date serial from SAST to UTC", () => {
  const sheetsValue = makeSouthAfricanSheetsSerial({
    year: 2026,
    month: 11,
    day: 20,
    hour: 8,
    minute: 10,
  });

  const result = normaliseAttendanceTimestamp(
    sheetsValue,
  );

  assert.equal(
    result,
    "2026-11-20T06:10:00.000Z",
  );
});


test("parses a numeric Sheets date serial into a valid Date", () => {
  const sheetsValue = makeSouthAfricanSheetsSerial({
    year: 2026,
    month: 11,
    day: 20,
    hour: 8,
    minute: 10,
  });

  const result = parseAttendanceTimestamp(
    sheetsValue,
  );

  assert.ok(result instanceof Date);

  assert.equal(
    result.toISOString(),
    "2026-11-20T06:10:00.000Z",
  );
});


// ============================================================
// 5. EXPLICIT TIMEZONE TESTS
// ============================================================

test("does not shift a timestamp that already has the +02:00 offset", () => {
  const result = normaliseAttendanceTimestamp(
    "2026-11-20T08:10:00+02:00",
  );

  assert.equal(
    result,
    "2026-11-20T06:10:00.000Z",
  );
});


test("does not add two hours to a timestamp that already uses UTC Z", () => {
  const result = normaliseAttendanceTimestamp(
    "2026-11-20T08:10:00Z",
  );

  assert.equal(
    result,
    "2026-11-20T08:10:00.000Z",
  );
});


test("respects an explicit timezone offset other than South Africa", () => {
  const result = normaliseAttendanceTimestamp(
    "2026-11-20T08:10:00-05:00",
  );

  assert.equal(
    result,
    "2026-11-20T13:10:00.000Z",
  );
});


test("preserves the instant represented by a JavaScript Date object", () => {
  const input = new Date(
    "2026-11-20T06:10:00.000Z",
  );

  const result = normaliseAttendanceTimestamp(input);

  assert.equal(
    result,
    "2026-11-20T06:10:00.000Z",
  );
});


// ============================================================
// 6. SOUTH AFRICAN DISPLAY TESTS
// ============================================================

test("formats a UTC timestamp as South African local time", () => {
  const result = formatSouthAfricanTimestamp(
    "2026-11-20T06:10:00.000Z",
  );

  assert.equal(typeof result, "string");

  assert.match(result, /2026/);
  assert.match(result, /08:10:00/);
});


test("returns null when asked to format an invalid timestamp", () => {
  assert.equal(
    formatSouthAfricanTimestamp("not-a-date"),
    null,
  );
});


// ============================================================
// 7. INVALID INPUT TESTS
// ============================================================

test("returns null for missing or invalid timestamp values", () => {
  const invalidValues = [
    null,
    undefined,
    "",
    "not-a-date",
    {},
    NaN,
    Infinity,
    -1,
    100001,
  ];

  for (const value of invalidValues) {
    assert.equal(
      normaliseAttendanceTimestamp(value),
      null,
      `Expected ${String(value)} to be rejected`,
    );
  }
});


test("returns null when parsing an invalid timestamp", () => {
  assert.equal(
    parseAttendanceTimestamp("not-a-date"),
    null,
  );
});


// ============================================================
// 8. CURRENT UTC TIMESTAMP TEST
// ============================================================

test("generates a valid ISO 8601 UTC timestamp", () => {
  const result = getCurrentUtcTimestamp();

  assert.match(
    result,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  );

  assert.ok(
    Number.isFinite(Date.parse(result)),
  );
});
