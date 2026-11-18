
/**
 * ============================================================
 * ATTENDANCE ROUTES
 * ============================================================
 *
 * PURPOSE:
 * - Define the HTTP endpoints for attendance information.
 * - Connect each endpoint to its controller function.
 *
 * Keeping routes separate from controller logic makes the API
 * easier to maintain and prevents business logic from being
 * duplicated inside route definitions.
 */
import express from "express";

import {
  getLiveAttendance,
  refreshLiveAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();


// ============================================================
// 1. LIVE ATTENDANCE ENDPOINT
// ============================================================

/**
 * GET /api/attendance/live
 *
 * Returns the most recently cached attendance records.
 *
 * The response includes:
 * - Employee records.
 * - Current onsite total.
 * - Latest refresh status.
 * - Last successful refresh timestamp.
 * - Stale-data information.
 * - Error information when appropriate.
 */
router.get("/live", getLiveAttendance);

// ============================================================
// 2. MANUAL REFRESH ENDPOINT
// ============================================================

/**
 * POST /api/attendance/refresh
 *
 * Requests a new attendance refresh.
 *
 * This endpoint is intended to support a manual Retry action
 * when the latest automatic refresh has failed.
 *
 * It uses the same controller refresh operation as the
 * automatic scheduler, preventing duplicate refresh logic.
 */
router.post("/refresh", refreshLiveAttendance);

export default router;
