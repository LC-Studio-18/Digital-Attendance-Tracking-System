import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["'],?$/g, "").replace(/\\n/g, "\n");
};

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_x509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const auth = getAuth();
export const db = getFirestore();
export default { auth, db };
