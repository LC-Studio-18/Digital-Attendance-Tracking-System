import { jest } from '@jest/globals';

// Must mock BEFORE importing anything that uses firebaseService
jest.unstable_mockModule('../services/firebaseService.js', () => ({
  verifyIdToken: jest.fn(),
}));

// Dynamic imports, AFTER the mock is registered
const { verifyIdToken } = await import('../services/firebaseService.js');
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
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.statusCode).toBe(200);
  });

  it('returns 401 when the token is invalid', async () => {
    verifyIdToken.mockRejectedValueOnce(
      Object.assign(new Error('Invalid or expired token'), { status: 401 })
    );

    const res = await request(app)
      .post('/api/attendance/qr-checkin')
      .set('Authorization', 'Bearer bad-token');

    expect(res.statusCode).toBe(401);
  });
});