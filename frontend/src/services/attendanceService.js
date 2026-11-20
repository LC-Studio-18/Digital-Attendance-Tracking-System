import axios from 'axios';

// Works with both http://localhost:5000 and http://localhost:5000/api
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

// GET /api/attendance/live - the backend's latest attendance data
//   signal: lets the caller cancel the request
//   token:  Firebase ID token (needed once the endpoint is secured)
export async function fetchAttendance(signal, token) {
  const response = await axios.get(`${API_URL}/api/attendance/live`, {
    signal,
    headers: authHeaders(token),
    timeout: 10000,
  });
  return response.data;
}

// POST /api/attendance/refresh - asks the backend to re-read Google Sheets now.
// Used by the Retry button after a failed refresh.
export async function requestRefresh(signal, token) {
  const response = await axios.post(`${API_URL}/api/attendance/refresh`, null, {
    signal,
    headers: authHeaders(token),
    timeout: 15000,
  });
  return response.data;
}