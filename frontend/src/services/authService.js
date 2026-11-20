import {
  getFirebaseToken,
  getRoleFromClaims,
  getRoleFromToken,
} from '../utils/authToken.js';

/* The Firebase SDK is loaded lazily so screens can render (and tests can run)
   before auth is configured. A stored token remains the fallback. */
async function currentUser() {
  try {
    const { auth } = await import('../firebase/firebase.js');
    return auth?.currentUser ?? null;
  } catch {
    return null;
  }
}

/**
 * Return the current Firebase ID token and UI role.
 *
 * getIdTokenResult() supplies the verified custom claims issued by Firebase.
 * The stored token is only a fallback for a signed-out / not-yet-ready user.
 */
export async function getAuthSession() {
  const user = await currentUser();

  if (user) {
    try {
      const token = await user.getIdToken();
      let role;

      try {
        const tokenResult = await user.getIdTokenResult();
        role = getRoleFromClaims(tokenResult.claims);
      } catch {
        role = getRoleFromToken(token);
      }

      return { token, role };
    } catch {
      // Fall through to the stored token below.
    }
  }

  const token = getFirebaseToken();
  return { token, role: getRoleFromToken(token) };
}
