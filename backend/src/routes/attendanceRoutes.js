import express from "express";
import {getAttendanceHistory} from '../controllers/attendanceController.js';
import { verifyToken} from '../middleware/authMiddleware.js';
const router = express.Router();
// Route: GET /api/attendance
router.get('/attendance', verifyToken, getAttendanceHistory);

export default router;