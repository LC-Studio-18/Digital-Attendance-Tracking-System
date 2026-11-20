/**
 * Verifies that GET /api/attendance still uses the role-aware Google Sheets
 * retrieval helper with the verified Firebase user.
 *
 * Firebase verification and Google Sheets are stubbed with in-memory data so
 * no credentials are needed and no production spreadsheet is accessed.
 */
import { after, before, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

const verifiedUser = {
  uid: 'admin-uid',
  email: 'admin@example.test',
  role: 'admin',
};

const sheetRecords = [
  { id: 1, uid: 'staff-uid-1', date: '2026-11-18', status: 'Present' },
  { id: 2, uid: 'staff-uid-2', date: '2026-11-17', status: 'Absent' },
];

const roleAwareCalls = [];

mock.module('../src/config/firebase.js', {
  exports: {
    auth: {
      verifyIdToken: async () => verifiedUser,
    },
  },
});

mock.module('../src/services/googleSheetsService.js', {
  exports: {
    getRecordsByRole: async (user) => {
      roleAwareCalls.push(user);
      return sheetRecords.map((record) => ({ ...record }));
    },
    fetchAttendanceRecords: async () => {
      throw new Error('legacy fallback should not be used');
    },
  },
});

let server;
let baseUrl;

before(async () => {
  const { default: app } = await import('../src/app.js');
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/attendance uses role-aware Google Sheets retrieval with verified claims', async () => {
  const response = await fetch(`${baseUrl}/api/attendance?page=1&limit=1`, {
    headers: { authorization: 'Bearer admin-token' },
  });

  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.totalRecords, 2);
  assert.equal(body.totalPages, 2);
  assert.equal(body.count, 1);
  assert.deepEqual(
    body.data.map((record) => record.id),
    [1],
  );
  assert.deepEqual(roleAwareCalls, [verifiedUser]);
});
