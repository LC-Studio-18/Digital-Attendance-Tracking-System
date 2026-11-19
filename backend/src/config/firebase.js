import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const requiredVariables = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];
const missingVariables = requiredVariables.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingVariables.join(', ')}`
  );
}

if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    .trim()
    // Allow a service-account JSON private_key value pasted into .env as-is.
    .replace(/^['"]/, '')
    .replace(/["'],?$/, '')
    .replace(/\\n/g, '\n');

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
      privateKey,
    }),
  });
}

export const auth = getAuth();
