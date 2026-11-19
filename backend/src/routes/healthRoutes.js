import express from 'express';
import { getHealth } from '../controllers/healthController.js';
import { getAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/attendance', getAttendance);

export default router;
