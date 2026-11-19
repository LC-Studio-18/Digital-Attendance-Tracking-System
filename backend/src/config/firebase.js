import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const formatPrivateKey = (key = '') =>
  key
    .trim()
    .replace(/^["']|["']$/g, '') // strip wrapping quotes if they survived parsing
    .replace(/\\n/g, '\n')       // literal "\n" text -> real newlines
    .replace(/\r/g, '');         // drop Windows carriage returns

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });

export const auth = getAuth(app);
export default app;