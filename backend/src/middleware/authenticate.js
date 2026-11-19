
import { verifyFirebaseToken } from './authorization.js';

export async function authenticate(req, res, next) {
  return verifyFirebaseToken(req, res, next);
}
