import {
  browserLocalPersistence,
  browserSessionPersistence,
  getIdTokenResult,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const createAuthError = (code, message) =>
  Object.assign(new Error(message), { code });

const requireFirebaseConfiguration = () => {
  if (!isFirebaseConfigured) {
    throw createAuthError(
      'app/firebase-config-missing',
      'Firebase configuration is missing from the frontend environment.',
    );
  }
};

export const loginUser = async (email, password, rememberMe = false) => {
  requireFirebaseConfiguration();

  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }
  if (typeof password !== 'string' || !password) {
    throw createAuthError('auth/missing-password', 'A password is required.');
  }

  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence,
  );

  const credential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  return credential.user;
};

export const logoutUser = async () => {
  if (auth) await signOut(auth);
};

export const resetPassword = async (email) => {
  requireFirebaseConfiguration();

  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }

  return sendPasswordResetEmail(auth, normalizedEmail);
};

export const getFirebaseIdToken = async (user = auth?.currentUser) =>
  user ? user.getIdToken() : null;

export const getUserRole = async (user) => {
  if (!user) return 'user';

  const { claims } = await getIdTokenResult(user);
  if (claims.admin === true) return 'admin';

  return typeof claims.role === 'string' && claims.role.trim()
    ? claims.role.trim().toLowerCase()
    : 'user';
};
