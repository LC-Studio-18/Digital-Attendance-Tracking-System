import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Strips stray spaces, quotes, and trailing commas (common when copying from the service account JSON)
const clean = (v = '') => v.trim().replace(/^["'\s]+|["',;\s]+$/g, '');

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
      projectId: clean(process.env.FIREBASE_PROJECT_ID),
      clientEmail: clean(process.env.FIREBASE_CLIENT_EMAIL),
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });

export const auth = getAuth(app);
export default app;