import admin from '../config/firebase.js'; // provided by the Firebase team

const fail = (status, message) => Object.assign(new Error(message), { status });

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw fail(401, 'Missing authentication token');

  try {
    req.user = await admin.auth().verifyIdToken(token);
  } catch {
    throw fail(401, 'Invalid or expired token');
  }
  next();
}