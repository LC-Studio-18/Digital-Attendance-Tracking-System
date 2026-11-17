import { auth } from '../services/firebase.js';

// Authorization middleware to check if the user is authenticated
export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization;

    // Extract token
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
    const decoded = await auth.verifyIdToken(idToken);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
    };
    next();
  }catch (error) {
    console.error('Token verification failed:', error.code);
    return res.status(401).json({
      success: false,
      message: 'Invalid token provided.',
    });
  }
}