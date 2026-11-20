import axios from 'axios';
import { API_BASE_URL } from './attendanceApi.js';

export const REPORTS_EXPORT_PATH = '/api/reports/export';
export const DEFAULT_EXPORT_FILENAME = 'attendance-report.csv';
export const DEFAULT_EXPORT_ERROR =
  'We could not export the CSV. Please try again.';

/** Read the filename the API advertises, falling back to a stable default. */
export function filenameFromContentDisposition(header) {
  if (!header) return '';

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].replace(/^"|"$/g, '').trim());
    } catch {
      return utf8[1].replace(/^"|"$/g, '').trim();
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : '';
}

/** Map transport errors to the safe shape used by the shared messages. */
function toError(error) {
  if (error?.code === 'export_failed') return error;

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
 * Successful responses are Blobs. A JSON body (even with a 200 status) is
 * inspected so an API-level failure is not silently downloaded as a file.
 */
async function readApiMessage(response) {
  const headerMessage =
    response.headers?.['x-message'] ?? response.headers?.['X-Message'];
  if (headerMessage) return String(headerMessage);

  const contentType = String(response.headers?.['content-type'] ?? '');
  if (
    !contentType.includes('application/json') ||
    typeof response.data?.text !== 'function'
  ) {
    return '';
  }

  const text = await response.data.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return '';
  }

  if (payload && (payload.success === false || payload.error)) {
    const apiMessage =
      typeof payload.error === 'string'
        ? payload.error
        : typeof payload.message === 'string'
          ? payload.message
          : '';
    throw {
      code: 'export_failed',
      message: apiMessage || DEFAULT_EXPORT_ERROR,
    };
  }

  return payload && typeof payload.message === 'string' ? payload.message : '';
}

/**
 * GET /api/reports/export with the selected date range.
 * Returns `{ blob, filename, message }` and throws `{ code, message? }`.
 */
export async function exportAttendanceReport({
  startDate = '',
  endDate = '',
  token,
  signal,
} = {}) {
  const params = Object.fromEntries(
    Object.entries({ startDate, endDate }).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

  try {
    const response = await axios.get(
      `${API_BASE_URL}${REPORTS_EXPORT_PATH}`,
      {
        params: Object.keys(params).length ? params : undefined,
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal,
      }
    );

    const message = await readApiMessage(response);
    const filename =
      filenameFromContentDisposition(
        response.headers?.['content-disposition'] ??
          response.headers?.['Content-Disposition']
      ) || DEFAULT_EXPORT_FILENAME;

    return { blob: response.data, filename, message };
  } catch (error) {
    throw toError(error);
  }
}
