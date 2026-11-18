import { jest } from '@jest/globals';

process.env.VALID_LOCATION_IDS = 'test-location-001';

jest.unstable_mockModule('../services/firebaseService.js', () => ({
  verifyIdToken: jest.fn(),
}));

jest.unstable_mockModule('../services/googleSheetsService.js', () => ({
  appendRow: jest.fn().mockResolvedValue(undefined),
  findTodayCheckin: jest.fn().mockResolvedValue(false),
}));

const { verifyIdToken } = await import('../services/firebaseService.js');
const { findTodayCheckin, appendRow } = await import('../services/googleSheetsService.js');

const { default: app } = await import('../app.js');
const request = (await import('supertest')).default;

describe('POST /api/attendance/qr-checkin', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).post('/api/attendance/qr-checkin');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 200 when the token is valid', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'test-location-001' });

    expect(res.statusCode).toBe(200);
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
  });

  it('returns 400 when locationId is wrong', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'test-user-123' });

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer some-valid-token')
      .send({ locationId: 'wrong-id' });

    expect(res.statusCode).toBe(400);
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