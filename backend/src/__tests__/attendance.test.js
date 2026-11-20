import { jest } from '@jest/globals';

process.env.VALID_LOCATION_IDS = 'test-location-001';

jest.unstable_mockModule('../services/firebaseService.js', () => ({
  verifyIdToken: jest.fn(),
}));

jest.unstable_mockModule('../services/sheets.js', () => ({
  appendRow: jest.fn().mockResolvedValue(undefined),
  findTodayCheckin: jest.fn().mockResolvedValue(false),
  getRows: jest.fn().mockResolvedValue([]),
}));

jest.unstable_mockModule('../services/employeeService.js', () => ({
  getEmployeeByUid: jest.fn(),
}));

const { verifyIdToken } = await import('../services/firebaseService.js');
const { findTodayCheckin, appendRow } = await import('../services/sheets.js');
const { getEmployeeByUid } = await import('../services/employeeService.js');

const { default: app } = await import('../app.js');
const request = (await import('supertest')).default;

describe('POST /api/attendance/qr-checkin', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).post('/api/attendance/qr-checkin');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when the request has no body', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 200 when the token is valid', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'test-location-001' });

    expect(res.statusCode).toBe(200);
    expect(appendRow).toHaveBeenCalledWith(
      'Attendance',
      expect.arrayContaining([
        expect.any(String),
        expect.any(String),
        'test-user-123',
        'Clock In',
        'test-location-001',
        '',
      ])
    );
  });

  it('returns 401 when the token is invalid', async () => {
    verifyIdToken.mockRejectedValueOnce(
      Object.assign(new Error('Invalid or expired token'), { status: 401 })
    );

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer bad-token')
      .send({ locationId: 'test-location-001' });

    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when JSON is malformed', async () => {
    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Content-Type', 'application/json')
      .send('{"locationId":');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it.each([
    ['an empty body', {}],
    ['an array body', []],
    ['a string body', 'LC-STUDIO-MAIN'],
    ['a missing locationId', { other: 'value' }],
    ['a non-string locationId', { locationId: 123 }],
    ['a blank locationId', { locationId: '  ' }],
    ['an incorrectly formatted locationId', { locationId: 'LC_STUDIO_MAIN' }],
    ['an unexpected field', { locationId: 'test-location-001', extra: true }],
  ])('returns 400 for %s', async (_description, body) => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 when locationId is wrong', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'wrong-id' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 503 when Google Sheets is not configured', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });
    findTodayCheckin.mockRejectedValueOnce(
      Object.assign(new Error('Google Sheets is not configured'), { status: 503 })
    );

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'test-location-001' });

    expect(res.statusCode).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 409 when already checked in today', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });
    findTodayCheckin.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'test-location-001' });

    expect(res.statusCode).toBe(409);
  });

  it('returns 502 when Google Sheets fails', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });
    findTodayCheckin.mockResolvedValueOnce(false);
    appendRow.mockRejectedValueOnce(
      Object.assign(new Error('Google Sheets request failed'), { status: 502 })
    );

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'test-location-001' });

    expect(res.statusCode).toBe(502);
  });
});

describe('GET /api/attendance/me/dashboard', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/attendance/me/dashboard');

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the Firebase token is invalid', async () => {
    verifyIdToken.mockRejectedValueOnce(
      Object.assign(new Error('Invalid or expired token'), { status: 401 })
    );

    const res = await request(app)
      .get('/api/attendance/me/dashboard')
      .set('Authorization', 'Bearer bad-token');

    expect(res.statusCode).toBe(401);
  });

  it('returns 404 when the employee record is not found', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'unknown-user' });
    getEmployeeByUid.mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/attendance/me/dashboard')
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.statusCode).toBe(404);
  });

  it('returns 403 when the employee is inactive', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });
    getEmployeeByUid.mockResolvedValueOnce({
      uid: 'test-user-123',
      name: 'Test User',
      active: false,
      lastClockIn: null,
      lastClockOut: null,
      history: [],
    });

    const res = await request(app)
      .get('/api/attendance/me/dashboard')
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.statusCode).toBe(403);
  });

  it('passes unexpected token verification errors to the central error handler', async () => {
    verifyIdToken.mockRejectedValueOnce(new Error('Firebase verification failed'));

    const res = await request(app)
      .get('/api/attendance/me/dashboard')
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Firebase verification failed',
    });
    expect(res.body).not.toHaveProperty('stack');
  });

  it('passes unexpected employee lookup errors to the central error handler', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });
    getEmployeeByUid.mockRejectedValueOnce(new Error('Employee lookup failed'));

    const res = await request(app)
      .get('/api/attendance/me/dashboard')
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Employee lookup failed',
    });
    expect(res.body).not.toHaveProperty('stack');
  });

  it('returns 200 with the employee data when active', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });
    getEmployeeByUid.mockResolvedValueOnce({
      uid: 'test-user-123',
      name: 'Test User',
      active: true,
      lastClockIn: '2026-11-19T08:00:00.000Z',
      lastClockOut: null,
      history: [{ timestamp: '2026-11-19T08:00:00.000Z', status: 'Present' }],
    });

    const res = await request(app)
      .get('/api/attendance/me/dashboard')
      .set('Authorization', 'Bearer some-valid-token')
      .query({ userId: 'other-user' });

    expect(res.statusCode).toBe(200);
    expect(getEmployeeByUid).toHaveBeenCalledWith('test-user-123');
    expect(res.body.data).toEqual({
      name: 'Test User',
      status: 'Present',
      lastClockIn: '2026-11-19T08:00:00.000Z',
      lastClockOut: null,
      history: [{ timestamp: '2026-11-19T08:00:00.000Z', status: 'Present' }],
    });
  });
});
