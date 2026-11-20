import express from 'express';
import { getAttendance, appendAttendanceRow } from '../services/sheets.js';
import { getEmployeeByUid } from '../services/employeeService.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get attendance records
router.get('/', async (req, res, next) => {
  try {
    const attendance = await getAttendance();
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

// Record Clock In or Clock Out
router.post('/check-in', verifyToken(), async (req, res, next) => {
  try {
    const { status, location = '', comment = '' } = req.body;

    if (!['IN', 'OUT'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be IN or OUT.',
      });
    }

    // Firebase UID comes from the verified token
    const uid = req.uid;

    // Find the employee using their Firebase UID
    const employee = await getEmployeeByUid(uid);

    // Create the attendance record
    const timestamp = new Date().toISOString();
    const eventType = status === 'IN' ? 'Clock In' : 'Clock Out';

    await appendAttendanceRow({
      employeeId: employee?.employeeId || '',
      uid,
      timestamp,
      eventType,
      location,
      comment,
    });

    return res.status(200).json({
      success: true,
      message: `${eventType} successful.`,
      employeeId: employee?.employeeId || null,
      uid,
      timestamp,
    });
  } catch (error) {
    next(error);
  }
});

export default router;