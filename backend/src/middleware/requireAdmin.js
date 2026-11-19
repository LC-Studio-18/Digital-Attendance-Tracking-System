export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid token',
    });
  }

  const isAdmin =
    req.user.role === 'admin' ||
    req.user.admin === true;

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required',
    });
  }

  return next();
};
