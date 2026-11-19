

import express from 'express';

import { clockOut } from '../controllers/attendanceController.js';
import { firebaseAuthMiddleware } from '../middleware/firebaseAuth.js';

const router = express.Router();

// POST /api/attendance/clock-out
// Verify the Firebase ID token before processing clock-out.
router.post('/clock-out', firebaseAuthMiddleware, clockOut);

export default router;

