import { auth } from "../config/firebase.js";

const getBearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
};

const UNAUTHORIZED_CODES = [
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/argument-error",
];

export const verifyToken =
  ({ checkRevoked = false } = {}) =>
  async (req, res, next) => {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        status: "error",
        message:
          "Authentication required: missing or malformed Authorization header",
      });
    }

    try {
      const decoded = await auth.verifyIdToken(token, checkRevoked);
      req.user = decoded; // full decoded token (email, custom claims, etc.)
      req.uid = decoded.uid; // the Firebase UID
      next();
    } catch (err) {
      console.error("[auth]", err.code, err.message); // server log only, never sent to the client
      if (err.code === "auth/id-token-expired") {
        return res.status(401).json({
          status: "error",
          message: "Token expired. Please sign in again.",
          code: err.code,
        });
      }
      if (UNAUTHORIZED_CODES.includes(err.code)) {
        return res.status(401).json({
          status: "error",
          message: "Invalid authentication token",
          code: err.code,
        });
      }
      next(err); // unexpected errors go to your errorHandler
    }
  };
