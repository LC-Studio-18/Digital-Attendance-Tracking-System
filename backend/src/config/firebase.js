import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";
import dotenv from "dotenv";

dotenv.config();

const require = createRequire(import.meta.url);
const serviceAccount = require("../../serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const auth = getAuth();
export const db = getFirestore();
export default { auth, db };
