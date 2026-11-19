
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Read Firebase service-account details from .env.
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
  client_x509_cert_url:
    process.env.FIREBASE_CLIENT_x509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Check that required credentials exist.
const requiredFields = [
  'project_id',
  'private_key',
  'client_email',
];

const missingFields = requiredFields.filter(
  (field) => !serviceAccount[field]
);

if (missingFields.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingFields.join(', ')}`
  );
}

// Initialise Firebase Admin only once.
const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

// Export Firebase Authentication.
export const firebaseAuth = getAuth(firebaseApp);
