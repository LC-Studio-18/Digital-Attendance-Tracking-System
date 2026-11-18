import express from 'express';
import { getLiveAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/live', getLiveAttendance);

export default router;