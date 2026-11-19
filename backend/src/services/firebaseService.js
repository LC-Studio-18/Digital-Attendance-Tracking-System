
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

let initializationPromise = null;

const serviceAccountPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../serviceAccountKey.json'
);

async function initFirebase() {
  if (getApps().length) {
    return getAuth();
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
      } = process.env;

      let credentials;

      if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
        credentials = {
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
      } else {
        try {
          credentials = JSON.parse(
            await readFile(serviceAccountPath, 'utf8')
          );
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;

          const configError = new Error('Firebase is not configured');
          configError.status = 503;
          throw configError;
        }
      }

      const app = initializeApp({
        credential: cert(credentials),
      });

      return getAuth(app);
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export async function verifyIdToken(token) {
  const auth = await initFirebase();

  try {
    return await auth.verifyIdToken(token);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
}
