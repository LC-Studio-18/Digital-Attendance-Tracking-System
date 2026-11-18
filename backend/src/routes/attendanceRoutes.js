import express from "express";
import {getAttendanceHistory} from '../controllers/attendanceController.js';

const router = express.Router();
//Route: GET /api/v1/attendance/history
router.get('/history', getAttendanceHistory);

export default router;