import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

let initialized = false;
const serviceAccountPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../serviceAccountKey.json');

async function initFirebase() {
  if (initialized) return;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  let credentials;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    credentials = {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else {
    try {
      credentials = JSON.parse(await readFile(serviceAccountPath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      console.warn('Firebase credentials are not set — auth will fail until they are added to .env or serviceAccountKey.json');
      return;
    }
  }

  initializeApp({ credential: cert(credentials) });

  initialized = true;
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
