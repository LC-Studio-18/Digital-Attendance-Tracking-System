import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { API_BASE_URL } from './attendanceApi.js';
import {
  DEFAULT_EXPORT_FILENAME,
  REPORTS_EXPORT_PATH,
  exportAttendanceReport,
  filenameFromContentDisposition,
} from './reportsApi.js';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reportsApi', () => {
  it('requests the report with the date range and returns the file details', async () => {
    const blob = new Blob(['Date,Staff\r\n'], { type: 'text/csv' });
    axios.get.mockResolvedValue({
      data: blob,
      headers: {
        'content-disposition': 'attachment; filename="attendance-2026.csv"',
        'x-message': 'Report ready.',
      },
    });

    const result = await exportAttendanceReport({
      startDate: '2026-11-01',
      endDate: '2026-11-19',
      token: 'firebase-token',
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}${REPORTS_EXPORT_PATH}`,
      expect.objectContaining({
        params: { startDate: '2026-11-01', endDate: '2026-11-19' },
        responseType: 'blob',
        headers: { Authorization: 'Bearer firebase-token' },
      })
    );
    expect(result).toEqual({
      blob,
      filename: 'attendance-2026.csv',
      message: 'Report ready.',
    });
  });

  it('omits empty date values and uses a stable fallback filename', async () => {
    axios.get.mockResolvedValue({ data: new Blob(['']), headers: {} });

    const result = await exportAttendanceReport({ startDate: '', endDate: '' });

    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}${REPORTS_EXPORT_PATH}`,
      expect.objectContaining({ params: undefined })
    );
    expect(result.filename).toBe(DEFAULT_EXPORT_FILENAME);
    expect(result.message).toBe('');
  });

  it('reads UTF-8 and plain content-disposition filenames', () => {
    expect(
      filenameFromContentDisposition("attachment; filename*=UTF-8''report%20Nov.csv")
    ).toBe('report Nov.csv');
    expect(
      filenameFromContentDisposition('attachment; filename="plain.csv"')
    ).toBe('plain.csv');
  });

  it('maps network failures to safe error codes', async () => {
    axios.get.mockRejectedValue({ code: 'ERR_NETWORK' });

    await expect(exportAttendanceReport()).rejects.toEqual({ code: 'network' });
  });

  it('surfaces an API-level failure from a JSON body', async () => {
    axios.get.mockResolvedValue({
      data: {
        text: async () =>
          JSON.stringify({ success: false, error: 'No records in range.' }),
      },
      headers: { 'content-type': 'application/json' },
    });

    await expect(exportAttendanceReport()).rejects.toEqual({
      code: 'export_failed',
      message: 'No records in range.',
    });
  });
});
