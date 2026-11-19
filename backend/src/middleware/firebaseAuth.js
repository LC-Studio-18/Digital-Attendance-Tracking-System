
import { firebaseAuth } from '../config/firebaseAdmin.js';

// Verify the Firebase ID token sent by the frontend.
export async function firebaseAuthMiddleware(req, res, next) {
  try {
    // Read the Authorization header.
    const authHeader = req.headers.authorization;

    // Check that the header contains a Bearer token.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Firebase token.',
      });
    }

    // Extract the Firebase ID token.
    const idToken = authHeader.split(' ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token is missing.',
      });
    }

    // Verify the token with Firebase Admin.
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    // Attach the verified Firebase user to the request.
    req.user = decodedToken;

    // Continue to the controller.
    return next();

  } catch (error) {
    console.error('Firebase authentication error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Firebase authentication token.',
    });
  }
}
