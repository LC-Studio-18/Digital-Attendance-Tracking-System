/**
 * Role-authorisation and response-shape tests for
 * GET /api/attendance.
 *
 * IMPORTANT: Firebase verifyIdToken is STUBBED in this file. It returns
 * predefined claims based on the token string so that staff/admin filtering
 * can be tested deterministically without real Firebase accounts. These tests
 * prove the controller's authorisation and filtering behaviour; they do NOT
 * prove that Firebase issued or verified the token. Real Firebase verification
 * is exercised in attendanceAuth.test.js.
 *
 * Google Sheets is also replaced with safe in-memory fixture data. No
 * production spreadsheet is read or modified.
 */
import { after, before, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

const tokenClaims = {
  'staff-one-token': {
    uid: 'staff-uid-1',
    email: 'staff1@example.test',
    role: 'staff',
  },
  'staff-two-token': {
    uid: 'staff-uid-2',
    email: 'staff2@example.test',
    role: 'staff',
  },
  'staff-empty-token': {
    uid: 'staff-with-no-records',
    email: 'staff3@example.test',
    role: 'staff',
  },
  'admin-token': {
    uid: 'admin-uid',
    email: 'admin@example.test',
    role: 'admin',
  },
  'manager-token': {
    uid: 'manager-uid',
    email: 'manager@example.test',
    role: 'manager',
  },
  'no-role-token': {
    uid: 'no-role-uid',
    email: 'no-role@example.test',
  },
};

mock.module('../src/config/firebase.js', {
  exports: {
    auth: {
      verifyIdToken: async (token) => {
        const claims = tokenClaims[token];
        if (!claims) {
          throw new Error('stub: invalid token');
        }
        return claims;
      },
    },
  },
});

const fixtureRows = [
  ['id', 'uid', 'date', 'status', 'name'],
  [1, 'staff-uid-1', '2026-11-01', 'Present', 'Staff One'],
  [2, 'staff-uid-2', '2026-11-03', 'Absent', 'Staff Two'],
  [3, 'admin-uid', '2026-11-02', 'Present', 'Admin User'],
  [4, 'staff-uid-1', '2026-11-04', 'Present', 'Staff One'],
];

mock.module('../src/services/sheets.js', {
  exports: {
    getAttendance: async () => fixtureRows.map((row) => [...row]),
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

const requestHistory = (token, query = '') => {
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  return fetch(`${baseUrl}/api/attendance${query}`, { headers });
};

test('a Staff token returns only that staff member own records', async () => {
  const response = await requestHistory('staff-one-token');
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.totalRecords, 2);
  assert.equal(body.count, 2);
  assert.equal(body.currentPage, 1);
  assert.deepEqual(
    body.data.map((record) => record.uid),
    ['staff-uid-1', 'staff-uid-1'],
  );
  assert.deepEqual(
    body.data.map((record) => record.id),
    [4, 1],
  );
});

test('a Staff token cannot read another user or Admin records', async () => {
  const response = await requestHistory('staff-one-token');
  const body = await response.json();

  const returnedUids = new Set(body.data.map((record) => record.uid));
  assert.deepEqual([...returnedUids], ['staff-uid-1']);
  assert.ok(!returnedUids.has('staff-uid-2'));
  assert.ok(!returnedUids.has('admin-uid'));
  assert.ok(!body.data.some((record) => record.name === 'Admin User'));
});

test('a Staff token cannot escalate access with a role query parameter or header', async () => {
  const response = await fetch(
    `${baseUrl}/api/attendance?role=admin`,
    {
      headers: {
        authorization: 'Bearer staff-one-token',
        'x-role': 'admin',
      },
    },
  );
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.totalRecords, 2);
  assert.ok(
    body.data.every((record) => record.uid === 'staff-uid-1'),
    'staff token must never receive other users records',
  );
});

test('an Admin token can read attendance records for the whole organisation', async () => {
  const response = await requestHistory('admin-token');
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.totalRecords, 4);
  assert.equal(body.count, 4);
  assert.equal(body.currentPage, 1);
  assert.equal(body.totalPages, 1);
});

test('an unrecognised role is rejected with HTTP 403', async () => {
  const response = await requestHistory('manager-token');
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    success: false,
    message: 'Forbidden: Invalid role',
  });
});

test('a token with no role claim defaults to staff access', async () => {
  const response = await requestHistory('no-role-token');
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.totalRecords, 0);
  assert.deepEqual(body.data, []);
});

test('a Staff user with no matching records receives an empty data array', async () => {
  const response = await requestHistory('staff-empty-token');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    count: 0,
    totalRecords: 0,
    currentPage: 1,
    totalPages: 0,
    data: [],
  });
});

test('pagination returns the requested page and clamps invalid values', async () => {
  const secondPage = await requestHistory('admin-token', '?page=2&limit=2');
  assert.equal(secondPage.status, 200);

  const secondPageBody = await secondPage.json();
  assert.equal(secondPageBody.currentPage, 2);
  assert.equal(secondPageBody.count, 2);
  assert.equal(secondPageBody.totalPages, 2);
  assert.deepEqual(
    secondPageBody.data.map((record) => record.id),
    [3, 1],
  );

  const clamped = await requestHistory('admin-token', '?page=0&limit=-5');
  assert.equal(clamped.status, 200);

  // Invalid values fall back to the documented defaults (page 1, limit 20).
  const clampedBody = await clamped.json();
  assert.equal(clampedBody.currentPage, 1);
  assert.equal(clampedBody.count, 4);
  assert.equal(clampedBody.totalPages, 1);
});

test('records are sorted newest first before pagination', async () => {
  const response = await requestHistory('admin-token', '?page=1&limit=10');
  const body = await response.json();

  assert.deepEqual(
    body.data.map((record) => record.date),
    ['2026-11-04', '2026-11-03', '2026-11-02', '2026-11-01'],
  );
});

test('the history route still requires an Authorization header', async () => {
  const body = await (await requestHistory()).json();
  assert.equal(body.success, false);
  assert.equal(body.message, 'Unauthorized: Missing or malformed Bearer token');
});