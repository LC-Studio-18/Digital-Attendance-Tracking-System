import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is missing from .env');
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert(serviceAccountPath),
  });

export const auth = getAuth(app);
export default app;