
import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateCurrentOnsiteCount,
} from "./onSiteService.js";


test("Counts active employees whose latest event is Clock In", () => {

  const staff = [
    { userId: "UID001" },
    { userId: "UID002" },
    { userId: "UID003" },
  ];

  const clockEvents = [
    {
      userId: "UID001",
      eventType: "Clock In",
      timestamp: "2026-11-18T06:00:00.000Z",
    },
    {
      userId: "UID002",
      eventType: "Clock In",
      timestamp: "2026-11-18T06:10:00.000Z",
    },
    {
      userId: "UID003",
      eventType: "Clock Out",
      timestamp: "2026-11-18T06:15:00.000Z",
    },
  ];

  assert.equal(
    calculateCurrentOnsiteCount({ staff, clockEvents }),
    2
  );
});



test("Does not count employees whose latest event is Clock Out", () => {

  const staff = [
    { userId: "UID001" },
  ];

  // Generate timestamps relative to the current backend time.
  // This ensures both test events are valid past timestamps.
  const now = Date.now();

  const clockInTimestamp = new Date(
    now - 2 * 60 * 60 * 1000
  ).toISOString();

  const clockOutTimestamp = new Date(
    now - 60 * 60 * 1000
  ).toISOString();

  const clockEvents = [
    {
      userId: "UID001",
      eventType: "Clock In",
      timestamp: clockInTimestamp,
    },
    {
      userId: "UID001",
      eventType: "Clock Out",
      timestamp: clockOutTimestamp,
    },
  ];

  // The latest valid event is Clock Out.
  // Therefore, the employee must not be counted onsite.
  assert.equal(
    calculateCurrentOnsiteCount({ staff, clockEvents }),
    0
  );
});



test("Does not count employees without clock events", () => {

  const staff = [
    { userId: "UID001" },
  ];

  assert.equal(
    calculateCurrentOnsiteCount({
      staff,
      clockEvents: [],
    }),
    0
  );
});


test("Ignores unknown Firebase UIDs", () => {

  const staff = [
    { userId: "UID001" },
  ];

  const clockEvents = [
    {
      userId: "UNKNOWN_UID",
      eventType: "Clock In",
      timestamp: "2026-11-18T06:00:00.000Z",
    },
  ];

  assert.equal(
    calculateCurrentOnsiteCount({ staff, clockEvents }),
    0
  );
});


test("Ignores events with invalid timestamps", () => {

  const staff = [
    { userId: "UID001" },
  ];

  const clockEvents = [
    {
      userId: "UID001",
      eventType: "Clock In",
      timestamp: "invalid-date",
    },
  ];

  assert.equal(
    calculateCurrentOnsiteCount({ staff, clockEvents }),
    0
  );
});


test("Does not count conflicting events with identical timestamps", () => {

  const staff = [
    { userId: "UID001" },
  ];

  const clockEvents = [
    {
      userId: "UID001",
      eventType: "Clock In",
      timestamp: "2026-11-18T06:00:00.000Z",
    },
    {
      userId: "UID001",
      eventType: "Clock Out",
      timestamp: "2026-11-18T06:00:00.000Z",
    },
  ];

  assert.equal(
    calculateCurrentOnsiteCount({ staff, clockEvents }),
    0
  );
});
