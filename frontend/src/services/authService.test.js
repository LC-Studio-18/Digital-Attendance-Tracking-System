import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthSession } from './authService.js';

const mocks = vi.hoisted(() => ({ currentUser: null }));

vi.mock('../firebase/firebase.js', () => ({
  get auth() {
    return { currentUser: mocks.currentUser };
  },
}));

beforeEach(() => {
  mocks.currentUser = null;
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('getAuthSession', () => {
  it('uses the Firebase token and its custom role claim', async () => {
    mocks.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('firebase-token'),
      getIdTokenResult: vi
        .fn()
        .mockResolvedValue({ claims: { role: 'admin' } }),
    };

    const session = await getAuthSession();

    expect(session).toEqual({ token: 'firebase-token', role: 'admin' });
  });

  it('falls back to a stored token when nobody is signed in', async () => {
    const payload = btoa(JSON.stringify({ role: 'staff' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    window.localStorage.setItem('firebaseIdToken', `h.${payload}.s`);

    const session = await getAuthSession();

    expect(session.role).toBe('staff');
    expect(session.token).toBe(`h.${payload}.s`);
  });
});
