import axios from 'axios';

export async function postClockIn(token) {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/clock-in`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data; // { status, message, timestamp }
}