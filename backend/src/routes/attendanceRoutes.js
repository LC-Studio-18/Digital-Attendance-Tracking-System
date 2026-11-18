
import express from 'express';

// Import the controller responsible for handling clock-out requests.
import { clockOut } from '../controllers/attendanceController.js';

// Import demo authentication middleware.
// This is currently used for testing instead of Firebase token verification.
import { demoAuth } from '../middleware/demoAuth.js';

const router = express.Router();

// POST /api/attendance/clock-out
// First checks the demo authentication, then executes the clock-out controller.
router.post('/clock-out', demoAuth, clockOut);

// Export the router so it can be registered in app.js.
export default router;
