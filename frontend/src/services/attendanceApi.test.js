import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import {
  API_BASE_URL,
  ATTENDANCE_HISTORY_PATH,
  getAttendanceHistory,
} from './attendanceApi.js';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAttendanceHistory', () => {
  it('calls the history endpoint with the Firebase token', async () => {
    const records = [{ id: '1', status: 'OUT' }];
    axios.get.mockResolvedValue({ data: { history: records } });

    const result = await getAttendanceHistory({ token: 'firebase-token' });

    expect(result).toEqual(records);
    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}${ATTENDANCE_HISTORY_PATH}`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer firebase-token' },
      })
    );
  });

  it('maps network failures to safe error codes', async () => {
    axios.get.mockRejectedValue({ code: 'ERR_NETWORK' });

    await expect(getAttendanceHistory()).rejects.toEqual({ code: 'network' });
  });
});
