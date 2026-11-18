
export function demoAuth(req, res, next) {
  // Read the demo Firebase UID from the request headers.
  const firebaseUid = req.headers['x-demo-firebase-uid'];

  // Reject the request if the Firebase UID header is missing.
  if (!firebaseUid) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Attach the UID to the request so the controller can identify the employee.
  req.user = {
    uid: firebaseUid,
  };

  // Continue to the next middleware or controller.
  next();
}
