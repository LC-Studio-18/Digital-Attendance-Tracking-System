import { jest } from '@jest/globals';

const verifyIdTokenMock = jest.fn();

process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'firebase-test@example.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';

jest.unstable_mockModule('firebase-admin/app', () => ({
  cert: jest.fn(),
  getApps: jest.fn(() => [{}]),
  initializeApp: jest.fn(),
}));

jest.unstable_mockModule('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({ verifyIdToken: verifyIdTokenMock })),
}));

const { verifyIdToken } = await import('../services/firebaseService.js');

describe('verifyIdToken', () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
  });

  it.each([
    'auth/argument-error',
    'auth/id-token-expired',
    'auth/id-token-revoked',
    'auth/invalid-id-token',
  ])('maps %s to 401', async (code) => {
    verifyIdTokenMock.mockRejectedValueOnce(
      Object.assign(new Error('Firebase verification failed'), { code })
    );

    await expect(verifyIdToken('invalid-token')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid or expired token',
    });
  });

  it('rethrows unexpected Firebase verification errors', async () => {
    const error = Object.assign(new Error('Firebase service unavailable'), {
      code: 'auth/internal-error',
    });
    verifyIdTokenMock.mockRejectedValueOnce(error);

    await expect(verifyIdToken('token')).rejects.toBe(error);
  });
});
