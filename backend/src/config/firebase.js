import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const formatPrivateKey = (key = '') =>
  key
    .trim()
    .replace(/^["']|["']$/g, '') // strip wrapping quotes if they survived parsing
    .replace(/\\n/g, '\n') // literal "\n" text -> real newlines
    .replace(/\r/g, ''); // drop Windows carriage returns

const hasAdminCredentials = () =>
  Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_PRIVATE_KEY?.trim(),
  );

let app = getApps().length ? getApp() : null;

// Firebase Admin is only needed for token verification. Initialising it lazily
// keeps the API (health, sheets-backed auth, etc.) runnable without credentials.
export const getFirebaseApp = () => {
  if (app) return app;

  if (!hasAdminCredentials()) {
    const error = new Error(
      'Firebase Admin credentials are missing. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to backend/.env.',
    );
    error.status = 503;
    throw error;
  }

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });

  return app;
};

let authInstance = null;

export const getFirebaseAuth = () => {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
};

export default getFirebaseApp;
