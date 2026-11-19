/* Firebase ID tokens are JWTs. Decoding the payload is enough to choose which
   columns to render — it is NOT authorisation. The backend must verify the
   signature and enforce roles on every request. */

const TOKEN_KEYS = ['firebaseIdToken', 'idToken', 'authToken', 'token'];

function storage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage ?? null;
}

/** Read the Firebase ID token saved by the login flow. */
export function getFirebaseToken(key = 'firebaseIdToken') {
  const store = storage();
  if (!store) return null;

  const keys = key === 'firebaseIdToken' ? TOKEN_KEYS : [key];
  for (const candidate of keys) {
    const value = store.getItem(candidate);
    if (value) return value;
  }

  return window.sessionStorage?.getItem(key) ?? null;
}

/** Decode a JWT payload without verifying its signature. */
export function decodeTokenPayload(token) {
  if (typeof token !== 'string') return null;

  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const parsed = JSON.parse(
      decodeURIComponent(
        Array.from(
          decoded,
          (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`
        ).join('')
      )
    );
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Return the UI role from Firebase custom claims.
 *
 * Unknown, missing or malformed claims default to `staff` so admin-only
 * columns are never exposed by mistake.
 */
export function getRoleFromClaims(claims) {
  if (!claims || typeof claims !== 'object') return 'staff';

  const role = claims.role ?? claims.userRole;
  if (typeof role === 'string' && role.trim().toLowerCase() === 'admin') {
    return 'admin';
  }

  if (claims.admin === true) return 'admin';

  if (Array.isArray(claims.roles)) {
    const hasAdminRole = claims.roles.some(
      (item) => typeof item === 'string' && item.toLowerCase() === 'admin'
    );
    if (hasAdminRole) return 'admin';
  }

  return 'staff';
}

/** Decode a stored token and read its role claim. */
export function getRoleFromToken(token) {
  return getRoleFromClaims(decodeTokenPayload(token));
}
