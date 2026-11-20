/**
 * ============================================================
 * APPLICATION SERVER
 * ============================================================
 *
 * PURPOSE:
 * - Load environment variables before application startup.
 * - Start the Express API server.
 * - Start the automatic attendance refresh scheduler.
 * - Stop the scheduler during graceful shutdown.
 */

// Load environment variables before importing the application.
import dotenv from "dotenv";

dotenv.config();
const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'SPREADSHEET_ID', 'SHEET_RANGE'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Import the Express application after environment configuration.
const { default: app } = await import("./app.js");

// Import the attendance scheduler.
const {
  startAttendanceRefresh,
  stopAttendanceRefresh,
} = await import("./controllers/attendanceController.js");

// Use the configured port or the default development port.
const PORT = process.env.PORT || 5000;

// ============================================================
// 1. START THE API SERVER
// ============================================================

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ============================================================
// 2. START AUTOMATIC ATTENDANCE REFRESH
// ============================================================

// This performs an initial refresh and then starts scheduled
// refreshes using ATTENDANCE_REFRESH_INTERVAL_MS.
startAttendanceRefresh();

// ============================================================
// 3. GRACEFUL SHUTDOWN
// ============================================================

/**
 * Stops scheduled background work before closing the server.
 *
 * WHY:
 * This prevents the refresh timer from continuing to run when
 * the application is being stopped or restarted.
 */
function shutdown(signal) {
  console.log(`${signal} received. Shutting down server...`);

  stopAttendanceRefresh();

  server.close((error) => {
    if (error) {
      console.error("Server shutdown error:", error);
      process.exitCode = 1;
      return;
    }

    console.log("Server closed successfully.");
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
