import express from "express";
import {getAttendanceHistory} from '../controllers/attendanceController.js';
import { verifyToken} from '../middleware/authMiddleware.js';
const router = express.Router();
//Route: GET /api/v1/attendance/history
router.get('/history', verifyToken, getAttendanceHistory);

export default router;