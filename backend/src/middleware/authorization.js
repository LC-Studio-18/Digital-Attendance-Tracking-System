
import { verifyIdToken } from '../services/firebaseService.js';

export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Use Authorization: Bearer <token>',
      });
    }

    const idToken = header.split(' ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Token is empty',
      });
    }

    const decoded = await verifyIdToken(idToken);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);

    return res.status(error.status || 401).json({
      success: false,
      message: error.message || 'Invalid token provided.',
    });
  }
}
