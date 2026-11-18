
const validRoles = ["Admin", "Staff"];

export const authorizeRole = (...allowedRoles) => {
  const invalidRoles = allowedRoles.filter(
    (role) => !validRoles.includes(role)
  );

  if (allowedRoles.length === 0 || invalidRoles.length > 0) {
    throw new Error("Invalid role configuration in authorizeRole.");
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!validRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "User role is missing or invalid."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
};
