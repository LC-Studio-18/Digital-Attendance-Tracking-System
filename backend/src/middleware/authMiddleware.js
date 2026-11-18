import { auth } from "../config/firebase.js";
import { sheetsClient, spreadsheetId } from "../config/googleSheets.js";

const EMPLOYEES_RANGE = "Employees!A:G";

export const verifyAuthAndAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No valid Firebase token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1]?.trim();
    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized: Empty Firebase token" });
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (tokenErr) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired Firebase token" });
    }

    let role = decodedToken.role || "admin";
    let status = decodedToken.status || "active";

    if (decodedToken.email) {
      try {
        const response = await sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: EMPLOYEES_RANGE,
        });
        const rows = response.data.values || [];
        const employeeRow = rows.slice(1).find((row) => row[3] === decodedToken.email);
        if (employeeRow) {
          role = employeeRow[5] || role;
          status = employeeRow[6] || status;
        }
      } catch (sheetErr) {
        // Fallback to token defaults if sheet check fails
      }
    }

    if (!role || role.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    if (status && status.toLowerCase() !== "active") {
      return res.status(403).json({ error: "Forbidden: Staff account is deactivated" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role,
      status: status || "active",
    };

    next();
  } catch (err) {
    const error = new Error(`Firebase authentication error: ${err.message}`);
    error.status = 500;
    next(error);
  }
};
