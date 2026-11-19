import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAttendanceHistoryResponse } from '../src/utils/attendanceResponse.js';

test('returns attendance records in the correct response structure', () => {
  const records = [
    { id: '1', uid: 'user123', date: '2026-11-18', status: 'Present' },
    { id: '2', uid: 'user456', date: '2026-11-17', status: 'Absent' },
  ];

  const result = buildAttendanceHistoryResponse({
    records,
    totalRecords: 2,
    page: 1,
    limit: 50,
  });

  assert.deepEqual(result, {
    success: true,
    count: 2,
    totalRecords: 2,
    currentPage: 1,
    totalPages: 1,
    data: records,
  });
});

test('returns an empty array when no attendance records exist', () => {
  const result = buildAttendanceHistoryResponse();

  assert.deepEqual(result, {
    success: true,
    count: 0,
    totalRecords: 0,
    currentPage: 1,
    totalPages: 0,
    data: [],
  });
});

test('calculates the correct number of pages', () => {
  const result = buildAttendanceHistoryResponse({
    records: [{ id: '1' }],
    totalRecords: 101,
    page: 1,
    limit: 50,
  });

  assert.equal(result.totalPages, 3);
});

test('sorts attendance records newest first without changing the original array', async () => {
  const { sortAttendanceRecords } = await import(
    '../src/utils/attendanceResponse.js'
  );

  const originalRecords = [
    { id: 1, date: '2026-11-01' },
    { id: 2, date: '2026-11-03' },
    { id: 3, date: '2026-11-02' },
  ];

  const result = sortAttendanceRecords(originalRecords);

  assert.deepEqual(
    result.map((record) => record.date),
    ['2026-11-03', '2026-11-02', '2026-11-01'],
  );

  assert.equal(originalRecords[0].id, 1);
});
