import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getAttendanceHistory } from '../controllers/attendanceController.js';

const router = express.Router();

// Mounted at '/api' in app.js -> GET /api/attendance
router.get('/', verifyToken, getAttendanceHistory);

export default router;