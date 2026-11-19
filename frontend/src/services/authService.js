import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getIdTokenResult,
  isSignInWithEmailLink,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import apiClient from './apiClient';
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

const requireUser = (user) => {
  if (!user) {
    throw createAuthError('auth/no-user', 'No user is currently signed in.');
  }
  return user;
};

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim() : '';

export const checkRegisteredEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }

  try {
    const { data } = await apiClient.post('/auth/check-email', {
      email: normalizedEmail,
    });

    if (!data?.exists) {
      throw createAuthError(
        'auth/email-not-registered',
        'This email is not registered for this attendance portal.',
      );
    }

    return true;
  } catch (error) {
    if (
      error.code === 'auth/email-not-registered' ||
      error.code === 'auth/invalid-email'
    ) {
      throw error;
    }

    throw createAuthError(
      'auth/email-check-failed',
      'We could not verify this email. Please try again.',
    );
  }
};

export const registerUser = async (email, password, displayName = '') => {
  requireFirebaseConfiguration();

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw createAuthError(
      'auth/weak-password',
      'Password must be at least 6 characters.',
    );
  }

  await checkRegisteredEmail(normalizedEmail);

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  const normalizedDisplayName =
    typeof displayName === 'string' ? displayName.trim() : '';
  if (normalizedDisplayName) {
    await updateProfile(credential.user, { displayName: normalizedDisplayName });
  }

  return credential.user;
};

export const loginUser = async (email, password, rememberMe = false) => {
  requireFirebaseConfiguration();

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }
  if (typeof password !== 'string' || !password) {
    throw createAuthError('auth/missing-password', 'A password is required.');
  }

  await checkRegisteredEmail(normalizedEmail);

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

export const sendPasswordlessSignInLink = async (email) => {
  requireFirebaseConfiguration();

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }

  await checkRegisteredEmail(normalizedEmail);

  const url = import.meta.env.VITE_EMAIL_LINK_URL || window.location.origin;

  await sendSignInLinkToEmail(auth, normalizedEmail, {
    url,
    handleCodeInApp: true,
  });

  window.localStorage.setItem('emailForSignIn', normalizedEmail);
};

export const isPasswordlessSignInLink = () =>
  Boolean(auth && isSignInWithEmailLink(auth, window.location.href));

export const completePasswordlessSignIn = async (email) => {
  requireFirebaseConfiguration();

  if (!isPasswordlessSignInLink()) return null;

  const storedEmail = window.localStorage.getItem('emailForSignIn');
  const signInEmail = normalizeEmail(email) || normalizeEmail(storedEmail);

  if (!signInEmail) {
    throw createAuthError(
      'auth/email-required',
      'Enter the email address that received the sign-in link.',
    );
  }

  await checkRegisteredEmail(signInEmail);

  const credential = await signInWithEmailLink(
    auth,
    signInEmail,
    window.location.href,
  );

  window.localStorage.removeItem('emailForSignIn');
  return credential.user;
};

export const logoutUser = async () => {
  if (auth) await signOut(auth);
};

export const resetPassword = async (email) => {
  requireFirebaseConfiguration();

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }

  await checkRegisteredEmail(normalizedEmail);

  return sendPasswordResetEmail(auth, normalizedEmail);
};

export const getCurrentUser = () => auth?.currentUser ?? null;

export const observeAuthState = (callback) => {
  requireFirebaseConfiguration();
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = (user = auth?.currentUser) => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providers: user.providerData.map((profile) => ({
      providerId: profile.providerId,
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
    })),
  };
};

export const updateUserProfile = async (
  { displayName, photoURL },
  user = auth?.currentUser,
) => {
  requireUser(user);
  return updateProfile(requireUser(user), {
    displayName,
    photoURL,
  });
};

export const changeUserEmail = async (newEmail, user = auth?.currentUser) => {
  const normalizedEmail = normalizeEmail(newEmail);
  if (!normalizedEmail) {
    throw createAuthError('auth/invalid-email', 'A valid email address is required.');
  }

  return updateEmail(requireUser(user), normalizedEmail);
};

export const sendVerificationEmail = async (user = auth?.currentUser) =>
  sendEmailVerification(requireUser(user));

export const changeUserPassword = async (
  newPassword,
  user = auth?.currentUser,
) => {
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw createAuthError(
      'auth/weak-password',
      'Password must be at least 6 characters.',
    );
  }

  return updatePassword(requireUser(user), newPassword);
};

export const reauthenticateWithPassword = async (
  password,
  user = auth?.currentUser,
) => {
  const currentUser = requireUser(user);
  const credential = EmailAuthProvider.credential(currentUser.email, password);
  return reauthenticateWithCredential(currentUser, credential);
};

export const deleteCurrentUser = async (user = auth?.currentUser) =>
  deleteUser(requireUser(user));

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
