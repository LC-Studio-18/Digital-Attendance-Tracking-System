import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// mock data

// Helper: it returns an ISO timestamp from "m" minutes ago
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

// Fake staff list, I can add more, but this is just the mock data
const MOCK_STAFF = [
  { id: 1, name: 'Micha Gys', status: 'IN', lastClockEvent: minutesAgo(15) },
  { id: 2, name: 'Chad Gys', status: 'IN', lastClockEvent: minutesAgo(9) },
  {
    id: 3,
    name: 'Theodore Jones',
    status: 'OUT',
    lastClockEvent: minutesAgo(25),
  },
  {
    id: 4,
    name: 'Mubaarik Cummings',
    status: 'IN',
    lastClockEvent: minutesAgo(50),
  },
];

// this pretends to be the API
async function getMockAttendance() {
  await new Promise((resolve) => setTimeout(resolve, 400)); // I'm simulating a fake network delay

  // Flip one random person so the auto refresh is visible
  const person = MOCK_STAFF[Math.floor(Math.random() * MOCK_STAFF.length)];
  person.status = person.status === 'IN' ? 'OUT' : 'IN';
  person.lastClockEvent = new Date().toISOString();

  const staff = MOCK_STAFF.map((s) => ({ ...s }));
  const totalIn = staff.filter((s) => s.name && s.status === 'IN').length;

  return { staff, totalIn };
}

// this is the real endpoint we are going to use
export async function fetchAttendance(signal, token) {
  if (USE_MOCK) return getMockAttendance();

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_URL}/api/attendance/live`, {
    signal,
    headers,
    timeout: 10000,
  });
  return response.data;
}
