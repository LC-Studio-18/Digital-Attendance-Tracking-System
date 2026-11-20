/**
 * Filtering tests for GET /api/v1/attendance/history.
 *
 * Firebase verifyIdToken and Google Sheets are stubbed with in-memory data so
 * no credentials are required and no production spreadsheet is accessed.
 * Real Firebase token verification is covered in attendanceAuth.test.js.
 */
import { after, before, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

const tokenClaims = {
  'admin-token': {
    uid: 'admin-uid',
    email: 'admin@example.test',
    role: 'admin',
  },
  'staff-one-token': {
    uid: 'staff-uid-1',
    email: 'staff1@example.test',
    role: 'staff',
  },
  'staff-three-token': {
    uid: 'staff-uid-3',
    email: 'staff3@example.test',
    role: 'staff',
  },
  'manager-token': {
    uid: 'manager-uid',
    email: 'manager@example.test',
    role: 'manager',
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

// Dates are strings from Google Sheets, including an ISO timestamp and
// alternate UID columns, to exercise sheet row mapping and filtering.
const fixtureRows = [
  ['id', 'uid', 'user_id', 'user id (firebase uid)', 'date', 'status'],
  [1, 'staff-uid-1', '', '', '2026-11-01', 'Present'],
  [2, 'staff-uid-2', '', '', '2026-11-03', 'Absent'],
  [3, '', 'staff-uid-1', '', '2026-11-04', 'Present'],
  [4, 'staff-uid-2', '', '', '2026-11-02', 'Present'],
  [5, 'staff-uid-1', '', '', '2026-11-04T08:15:00.000Z', 'Present'],
  [6, 'staff-uid-2', '', '', '', 'Present'],
  [7, '', '', 'staff-uid-3', '2026-11-05', 'Present'],
];

const expectedTotalRecords = fixtureRows.length - 1;

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
  return fetch(`${baseUrl}/api/v1/attendance/history${query}`, { headers });
};

const queryString = (params) => `?${new URLSearchParams(params)}`;

const ids = (body) => body.data.map((record) => record.id);

const assertBadRequest = async (response, messagePattern) => {
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.match(body.message, messagePattern);
};

test('no filters returns all records the admin is allowed to access', async () => {
  const response = await requestHistory('admin-token');
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.totalRecords, expectedTotalRecords);
  assert.equal(body.count, expectedTotalRecords);
  assert.deepEqual(ids(body), [7, 5, 3, 2, 4, 1, 6]);
});

test('a specific date filters records by the sheet date string', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ date: '2026-11-04' }),
  );
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.totalRecords, 2);
  assert.deepEqual(ids(body), [5, 3]);
});

test('a specific date matches records with an ISO timestamp and alternate UID column', async () => {
  const response = await requestHistory(
    'staff-three-token',
    queryString({ date: '2026-11-05' }),
  );

  const body = await response.json();
  assert.equal(body.totalRecords, 1);
  assert.deepEqual(ids(body), [7]);
});

test('a date range filters records inclusively between both boundaries', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ startDate: '2026-11-02', endDate: '2026-11-04' }),
  );

  const body = await response.json();
  assert.equal(body.totalRecords, 4);
  assert.deepEqual(ids(body), [5, 3, 2, 4]);
});

test('date range boundaries are inclusive when start equals end', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ startDate: '2026-11-01', endDate: '2026-11-01' }),
  );

  const body = await response.json();
  assert.equal(body.totalRecords, 1);
  assert.deepEqual(ids(body), [1]);
});

test('an open-ended range supports only startDate or only endDate', async () => {
  const fromStart = await requestHistory(
    'admin-token',
    queryString({ startDate: '2026-11-05' }),
  );
  assert.deepEqual(ids(await fromStart.json()), [7]);

  const fromEnd = await requestHistory(
    'admin-token',
    queryString({ endDate: '2026-11-01' }),
  );
  assert.deepEqual(ids(await fromEnd.json()), [1]);
});

test('an admin can filter by employee identifier', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ employeeId: 'staff-uid-2' }),
  );

  const body = await response.json();
  assert.equal(body.totalRecords, 3);
  assert.deepEqual(ids(body), [2, 4, 6]);
});

test('an admin can combine an employee filter with a specific date', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ employeeId: 'staff-uid-1', date: '2026-11-04' }),
  );

  const body = await response.json();
  assert.equal(body.totalRecords, 2);
  assert.deepEqual(ids(body), [5, 3]);
});

test('an admin can combine an employee filter with a date range', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({
      employeeId: 'staff-uid-1',
      startDate: '2026-11-01',
      endDate: '2026-11-04',
    }),
  );

  const body = await response.json();
  assert.equal(body.totalRecords, 3);
  assert.deepEqual(ids(body), [5, 3, 1]);
});

test('no matching records returns HTTP 200 with an empty data array', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ date: '2020-01-01' }),
  );
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

test('invalid date formats are rejected with HTTP 400', async () => {
  await assertBadRequest(
    await requestHistory('admin-token', queryString({ date: '18-11-2026' })),
    /Invalid date\. Use YYYY-MM-DD/,
  );
  await assertBadRequest(
    await requestHistory('admin-token', queryString({ date: '2026-13-01' })),
    /Invalid date/,
  );
  await assertBadRequest(
    await requestHistory('admin-token', queryString({ date: '2026-02-30' })),
    /Invalid date/,
  );
  await assertBadRequest(
    await requestHistory(
      'admin-token',
      queryString({ startDate: '18/11/2026' }),
    ),
    /Invalid startDate/,
  );
});

test('repeated date query parameters are rejected with HTTP 400', async () => {
  const response = await requestHistory(
    'admin-token',
    '?date=2026-11-01&date=2026-11-02',
  );
  await assertBadRequest(response, /Invalid date/);
});

test('an invalid date range is rejected with HTTP 400', async () => {
  await assertBadRequest(
    await requestHistory(
      'admin-token',
      queryString({ startDate: '2026-11-05', endDate: '2026-11-01' }),
    ),
    /Invalid date range/,
  );
});

test('a specific date cannot be combined with a date range', async () => {
  await assertBadRequest(
    await requestHistory(
      'admin-token',
      queryString({
        date: '2026-11-04',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
      }),
    ),
    /Use either date or startDate\/endDate/,
  );
});

test('invalid employee identifiers are rejected with HTTP 400', async () => {
  await assertBadRequest(
    await requestHistory(
      'admin-token',
      queryString({ employeeId: '<script>alert(1)</script>' }),
    ),
    /Invalid employeeId/,
  );
  await assertBadRequest(
    await requestHistory('admin-token', queryString({ employeeId: 'bad id' })),
    /Invalid employeeId/,
  );
  await assertBadRequest(
    await requestHistory(
      'admin-token',
      '?employeeId=staff-uid-1&employeeId=staff-uid-2',
    ),
    /Invalid employeeId/,
  );
  await assertBadRequest(
    await requestHistory('admin-token', queryString({ employeeId: 'x'.repeat(129) })),
    /Invalid employeeId/,
  );
});

test('blank filter values are treated as no filter', async () => {
  const response = await requestHistory(
    'admin-token',
    '?date=&startDate=&endDate=&employeeId=',
  );

  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.totalRecords, expectedTotalRecords);
});

test('staff filters are restricted to their own records', async () => {
  const response = await requestHistory(
    'staff-one-token',
    queryString({ date: '2026-11-04' }),
  );

  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.totalRecords, 2);
  assert.deepEqual(ids(body), [5, 3]);
  assert.ok(
    body.data.every((record) =>
      [record.uid, record.user_id].includes('staff-uid-1'),
    ),
  );
});

test('staff cannot read another employee by supplying employeeId', async () => {
  const response = await requestHistory(
    'staff-one-token',
    queryString({ employeeId: 'staff-uid-2' }),
  );

  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.totalRecords, 3);
  assert.deepEqual(ids(body), [5, 3, 1]);
  assert.ok(
    body.data.every(
      (record) => record.uid === 'staff-uid-1' || record.user_id === 'staff-uid-1',
    ),
    'staff must never receive another employees records',
  );
});

test('staff cannot combine employeeId and role parameters to escalate access', async () => {
  const response = await requestHistory(
    'staff-one-token',
    '?employeeId=staff-uid-2&role=admin',
  );

  const body = await response.json();
  assert.equal(response.status, 200);
  assert.ok(
    body.data.every(
      (record) => record.uid === 'staff-uid-1' || record.user_id === 'staff-uid-1',
    ),
  );
});

test('filtering is applied before pagination', async () => {
  const firstPage = await requestHistory(
    'admin-token',
    queryString({ date: '2026-11-04', page: 1, limit: 1 }),
  );
  const firstPageBody = await firstPage.json();
  assert.equal(firstPageBody.totalRecords, 2);
  assert.equal(firstPageBody.totalPages, 2);
  assert.equal(firstPageBody.count, 1);
  assert.deepEqual(ids(firstPageBody), [5]);

  const secondPage = await requestHistory(
    'admin-token',
    queryString({ date: '2026-11-04', page: 2, limit: 1 }),
  );
  const secondPageBody = await secondPage.json();
  assert.equal(secondPageBody.totalRecords, 2);
  assert.deepEqual(ids(secondPageBody), [3]);

  const emptyPage = await requestHistory(
    'admin-token',
    queryString({ date: '2026-11-04', page: 3, limit: 1 }),
  );
  const emptyPageBody = await emptyPage.json();
  assert.equal(emptyPageBody.totalRecords, 2);
  assert.deepEqual(emptyPageBody.data, []);
});

test('existing sorting and pagination behaviour is preserved without filters', async () => {
  const response = await requestHistory(
    'admin-token',
    queryString({ page: 2, limit: 2 }),
  );

  const body = await response.json();
  assert.equal(body.currentPage, 2);
  assert.equal(body.totalPages, 4);
  assert.deepEqual(ids(body), [3, 2]);
});

test('filter utility supports employeeid columns and slash-formatted sheet dates', async () => {
  const { filterAttendanceRecords } = await import(
    '../src/utils/attendanceFilters.js'
  );

  const records = [
    { id: 1, employeeid: 'EMP009', date: '2026/11/18' },
    { id: 2, employeeid: 'EMP010', date: '2026/11/18' },
    { id: 3, employeeid: 'EMP009', date: 'invalid-date' },
  ];

  const matched = filterAttendanceRecords(records, {
    employeeId: 'EMP009',
    date: '2026-11-18',
  });

  assert.deepEqual(
    matched.map((record) => record.id),
    [1],
  );
});

test('existing authentication and authorisation behaviour is preserved', async () => {
  const unauthorized = await requestHistory(
    undefined,
    queryString({ date: '2026-11-04' }),
  );
  assert.equal(unauthorized.status, 401);
  assert.equal(
    (await unauthorized.json()).message,
    'Unauthorized: Missing or malformed Bearer token',
  );

  const forbidden = await requestHistory(
    'manager-token',
    queryString({ date: '2026-11-04' }),
  );
  assert.equal(forbidden.status, 403);
  assert.deepEqual(await forbidden.json(), {
    success: false,
    message: 'Forbidden: Invalid role',
  });
});
