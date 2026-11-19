// Axios sends HTTP requests to the backend (used once the real API exists)
import axios from "axios";
// Dummy attendance events (copied from attendance.json)
import { DUMMY_ATTENDANCE } from "./dummyData";

// Backend address. Set VITE_API_URL in frontend/.env, e.g. http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Set to false when the real attendance endpoints are ready
const USE_DUMMY_DATA = true;

// The employee we pretend is logged in while testing with dummy data.
// Try other IDs to test each state:
//   firebase_uid_001 -> IN (clocked back in after lunch)
//   firebase_uid_002 -> OUT
//   firebase_uid_010 -> no attendance record
const DUMMY_USER_ID = "firebase_uid_001";

// Where the dummy events are saved in the browser so they survive a refresh.
// With the real API the backend keeps the records, so this is dummy-only.
const STORAGE_KEY = "dummyAttendanceEvents";

// Loads the saved events, or starts from the original dummy data
function loadDummyEvents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Storage unavailable or data damaged: fall back to the original data
  }
  return [...DUMMY_ATTENDANCE];
}

// Saves the current events so a page refresh keeps them
function saveDummyEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyEvents));
  } catch {
    // Storage unavailable: the status just won't survive a refresh
  }
}

// Working copy of the events. Clock-in and clock-out add to it.
const dummyEvents = loadDummyEvents();

// Pauses for 1 second to mimic a real request, so the loading state shows
function fakeDelay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

// Builds a timestamp for "right now", e.g. "2026-11-19T12:47:03+02:00".
// Uses the same format as the timestamps in attendance.json.
function nowTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return `${date}T${time}+02:00`;
}

// Turns "2026-11-19T12:47:03+02:00" into "12:47 PM".
// Reads the time straight from the text so the timezone does not shift it.
function formatTime(timestamp) {
  const [hours, minutes] = timestamp.slice(11, 16).split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Works out an employee's current status from the dummy attendance events
function getDummyStatus(userId) {
  // Keep only this employee's events
  const events = dummyEvents.filter((event) => event["User ID"] === userId);

  // No events means no attendance record
  if (events.length === 0) {
    return { status: null };
  }

  // The data is not in date order, so sort newest first
  events.sort((a, b) => Date.parse(b.Timestamp) - Date.parse(a.Timestamp));

  // The latest event decides the status
  const latest = events[0];

  if (latest["Event Type"] === "Clock In") {
    return { status: "IN", since: formatTime(latest.Timestamp) };
  }

  return { status: "OUT" };
}

// Adds a new dummy event for the pretend logged-in employee and saves it
function addDummyEvent(eventType) {
  dummyEvents.push({
    "Event ID": `EVT${String(dummyEvents.length + 1).padStart(3, "0")}`,
    Timestamp: nowTimestamp(),
    "User ID": DUMMY_USER_ID,
    "Event Type": eventType,
    Location: "Cape Town Office",
    Comment: "Dummy event",
  });
  saveDummyEvents();
}

// PROPOSED contract (to be agreed with Khanya G and Team 2):
//   GET /api/attendance/status
//   Header:   Authorization: Bearer <Firebase token>
//   Response: { status: "IN" | "OUT", since: "08:32 AM" }
//   If the employee has no attendance record, status is missing or null.
export async function getAttendanceStatus(token) {
  if (USE_DUMMY_DATA) {
    await fakeDelay();
    return getDummyStatus(DUMMY_USER_ID);
  }

  const response = await axios.get(`${API_URL}/api/attendance/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Return only the data the component needs
  return response.data;
}

// Clock in. Dummy version for testing; the real endpoint belongs to Team 2.
// PROPOSED: POST /api/attendance/clock-in
export async function clockIn(token) {
  if (USE_DUMMY_DATA) {
    await fakeDelay();
    addDummyEvent("Clock In");
    return;
  }

  await axios.post(
    `${API_URL}/api/attendance/clock-in`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

// Clock out. Dummy version for testing.
// PROPOSED: POST /api/attendance/clock-out
export async function clockOut(token) {
  if (USE_DUMMY_DATA) {
    await fakeDelay();
    addDummyEvent("Clock Out");
    return;
  }

  await axios.post(
    `${API_URL}/api/attendance/clock-out`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
}