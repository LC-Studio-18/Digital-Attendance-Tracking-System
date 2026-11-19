import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let authInstance = null;
const invalidTokenErrorCodes = new Set([
  'auth/argument-error',
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/invalid-id-token',
]);

function initFirebase() {
  if (authInstance) return authInstance;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase credentials not set — auth will fail till added');
    return null;
  }

  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }

    authInstance = getAuth();
    return authInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err.message);
    return null;
  }
}

export async function verifyIdToken(token) {
  const auth = initFirebase();

  if (!auth) {
    const error = new Error('Firebase is not configured');
    error.status = 503;
    throw error;
  }

  try {
    return await auth.verifyIdToken(token);
  } catch (err) {
    if (invalidTokenErrorCodes.has(err?.code)) {
      const error = new Error('Invalid or expired token');
      error.status = 401;
      throw error;
    }

    throw err;
  }
}