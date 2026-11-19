import { verifyIdToken } from '../services/firebaseService.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerMatch = typeof authHeader === 'string'
    ? /^Bearer ([^\s]+)$/.exec(authHeader)
    : null;

  if (!bearerMatch) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header',
    });
  }

  const token = bearerMatch[1];

  try {
    const decodedUser = await verifyIdToken(token);
    req.user = decodedUser; // now available to the controller later
    next();
  } catch (err) {
    return res.status(err.status || 401).json({
      success: false,
      message: err.message,
    });
  }
}