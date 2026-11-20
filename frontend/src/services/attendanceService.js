/*
Live API implementation. Uncomment this block when switching back to backend data.

import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export async function fetchLiveAttendance(signal, user) {
  if (!user) {
    throw new Error('Sign in with an admin account to view attendance.');
  }

  const token = await user.getIdToken();
  const response = await axios.get(`${API_URL}/api/attendance/live`, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000,
  });

  return response.data;
}
*/
