import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getAttendanceHistory } from '../controllers/attendanceController.js';

const router = express.Router();

// Mounted at '/api/v1/attendance' in app.js -> GET /api/v1/attendance/history
router.get('/history', verifyToken, getAttendanceHistory);

export default router;
