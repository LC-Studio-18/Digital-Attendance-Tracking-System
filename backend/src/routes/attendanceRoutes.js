import express from 'express';
import { verifyAuthAndAdmin } from '../middleware/authMiddleware.js';
import {
  getAttendanceRecords,
  handleCheckIn,
  handleCheckOut
} from '../controllers/attendanceController.js';

const router = express.Router();

// All attendance routes require valid Firebase token, admin role, and active staff status
router.get('/', verifyAuthAndAdmin, getAttendanceRecords);
router.post('/check-in', verifyAuthAndAdmin, handleCheckIn);
router.post('/check-out', verifyAuthAndAdmin, handleCheckOut);

export default router;
