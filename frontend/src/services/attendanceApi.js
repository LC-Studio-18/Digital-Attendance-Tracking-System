import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');
export const ATTENDANCE_HISTORY_PATH = '/api/v1/attendance/history';

/** Accept the array shapes the API may use and always return an array. */
function toRecords(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  for (const key of ['history', 'records', 'results', 'attendance', 'data']) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
}

/** Convert an Axios error into a safe code for the shared ErrorMessage. */
function toError(error) {
  if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
    return { code: 'cancelled' };
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return {
      code:
        typeof navigator !== 'undefined' && navigator.onLine === false
          ? 'offline'
          : 'network',
    };
  }

  const status = error.response.status;
  return {
    code: [401, 403, 404, 500, 502, 503, 504].includes(status) ? status : 500,
  };
}

/**
 * GET /api/v1/attendance/history with the Firebase token attached.
 * Returns a plain array of records; throws `{ code }` for safe error copy.
 */
export async function getAttendanceHistory({ token, signal, params } = {}) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${ATTENDANCE_HISTORY_PATH}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params,
        signal,
      }
    );

    return toRecords(response.data);
  } catch (error) {
    throw toError(error);
  }
}
