import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

let initialized = false;
const serviceAccountPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../serviceAccountKey.json');

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
  await initFirebase();

  if (!initialized) {
    const error = new Error('Firebase is not configured');
    error.status = 503;
    throw error;
  }

  try {
    return await getAuth().verifyIdToken(token);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
}
