/**
 * Security tests for GET /api/v1/attendance/history that use the REAL
 * Firebase Admin SDK token verifier.
 *
 * Notes on the environment:
 * - The local backend/.env FIREBASE_PRIVATE_KEY cannot be parsed as a PEM key,
 *   so src/config/firebase.js cannot initialise here. This test initialises a
 *   Firebase Admin app with only a project ID. ID-token verification uses
 *   Google's public certificates, not the service-account private key, so
 *   auth.verifyIdToken below is the genuine Firebase Admin SDK method. It is
 *   NOT replaced with a stub.
 * - Because no valid test ID tokens are available, the real SDK can prove
 *   rejection of malformed/invalid tokens. Acceptance of a valid token can
 *   only be tested when TEST_STAFF_ID_TOKEN / TEST_ADMIN_ID_TOKEN (and
 *   optionally TEST_EXPIRED_ID_TOKEN) are provided by the test runner. Those
 *   tests skip with an explicit reason when the tokens are absent.
 * - Google Sheets is replaced with in-memory fixture data so no production
 *   attendance records are read, written or modified.
 */
import 'dotenv/config';
import { after, before, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID || 'attendance-test-project';
const verificationApp = initializeApp(
  { projectId },
  'attendance-real-verifier-test',
);
const realAuth = getAuth(verificationApp);

let fixtureRecords = [];

mock.module('../src/config/firebase.js', {
  exports: { auth: realAuth },
});

mock.module('../src/services/googleSheetsService.js', {
  exports: {
    fetchAttendanceRecords: async () =>
      fixtureRecords.map((record) => ({ ...record })),
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

const requestHistory = (authorization, query = '') => {
  const headers = authorization === undefined ? {} : { authorization };
  return fetch(`${baseUrl}/api/v1/attendance/history${query}`, { headers });
};

const assertUnauthorized = async (response) => {
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.success, false);
  return body;
};

test('rejects a request with no Authorization header with HTTP 401', async () => {
  const body = await assertUnauthorized(await requestHistory());
  assert.equal(body.message, 'Unauthorized: Missing or malformed Bearer token');
});

test('rejects a non-Bearer authorization scheme with HTTP 401', async () => {
  const body = await assertUnauthorized(await requestHistory('Basic abc123'));
  assert.equal(body.message, 'Unauthorized: Missing or malformed Bearer token');
});

test('rejects a Bearer scheme with no token value with HTTP 401', async () => {
  const body = await assertUnauthorized(await requestHistory('Bearer'));
  assert.equal(body.message, 'Unauthorized: Missing or malformed Bearer token');
});

test('rejects an empty Bearer token through real Firebase verification with HTTP 401', async () => {
  const body = await assertUnauthorized(await requestHistory('Bearer '));
  assert.match(
    body.message,
    /^Unauthorized: (Invalid or expired token|Missing or malformed Bearer token)$/,
  );
});

test('rejects an invalid ID token through real Firebase verification with HTTP 401', async () => {
  const body = await assertUnauthorized(
    await requestHistory('Bearer not-a-real-firebase-id-token'),
  );
  assert.equal(body.message, 'Unauthorized: Invalid or expired token');
});

test('rejects a malformed JWT through real Firebase verification with HTTP 401', async () => {
  const body = await assertUnauthorized(
    await requestHistory('Bearer header.payload.signature'),
  );
  assert.equal(body.message, 'Unauthorized: Invalid or expired token');
});

const staffToken = process.env.TEST_STAFF_ID_TOKEN;
const adminToken = process.env.TEST_ADMIN_ID_TOKEN;
const expiredToken = process.env.TEST_EXPIRED_ID_TOKEN;
const noValidTokensReason =
  'Set TEST_STAFF_ID_TOKEN and TEST_ADMIN_ID_TOKEN to run real-token tests';
const noExpiredTokenReason =
  'Set TEST_EXPIRED_ID_TOKEN to run the real expired-token test';

test(
  'a real Staff ID token only returns records for its own Firebase UID',
  { skip: staffToken ? false : noValidTokensReason },
  async () => {
    const decoded = await realAuth.verifyIdToken(staffToken);
    fixtureRecords = [
      {
        id: 1,
        uid: decoded.uid,
        date: '2026-11-18',
        status: 'Present',
      },
      {
        id: 2,
        uid: 'another-user-uid',
        date: '2026-11-17',
        status: 'Present',
      },
      {
        id: 3,
        uid: 'admin-user-uid',
        date: '2026-11-16',
        status: 'Absent',
      },
    ];

    const response = await requestHistory(`Bearer ${staffToken}`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.totalRecords, 1);
    assert.equal(body.count, 1);
    assert.deepEqual(
      body.data.map((record) => record.uid),
      [decoded.uid],
    );
  },
);

test(
  'a real Admin ID token can read all attendance records',
  { skip: adminToken ? false : noValidTokensReason },
  async () => {
    const decoded = await realAuth.verifyIdToken(adminToken);
    assert.equal(
      decoded.role,
      'admin',
      'The test Admin token must contain role=admin; without it the API defaults to staff and filters by UID',
    );

    fixtureRecords = [
      { id: 1, uid: 'staff-a', date: '2026-11-18', status: 'Present' },
      { id: 2, uid: 'staff-b', date: '2026-11-17', status: 'Absent' },
    ];

    const response = await requestHistory(`Bearer ${adminToken}`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.totalRecords, 2);
    assert.equal(body.count, 2);
  },
);

test(
  'a real expired ID token is rejected with HTTP 401',
  { skip: expiredToken ? false : noExpiredTokenReason },
  async () => {
    const body = await assertUnauthorized(
      await requestHistory(`Bearer ${expiredToken}`),
    );
    assert.equal(body.message, 'Unauthorized: Invalid or expired token');
  },
);
