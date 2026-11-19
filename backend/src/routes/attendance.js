
import express from 'express';
import { appendAttendanceRow } from '../services/googleSheetsService.js';
import { verifyFirebaseToken } from '../middleware/authorization.js';
import { authenticate } from '../middleware/authenticate.js';
import { qrCheckin } from '../controllers/attendanceController.js';

const router = express.Router();

// Authenticated clock-in / clock-out
router.post('/attendance/check-in', verifyFirebaseToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { uid } = req.user;

    if (!['IN', 'OUT'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "IN" or "OUT".',
      });
    }

    const timestamp = new Date().toISOString();
    const eventType = status === 'IN' ? 'Clock-in' : 'Clock-out';

    await appendAttendanceRow({
      userID: uid,
      timestamp,
      eventType,
      locationId: '',
      comment: 'App check-in',
    });

    return res.status(200).json({
      success: true,
      message: `${eventType} successful.`,
    });
  } catch (error) {
    console.error('Error checking in attendance:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error.',
    });
  }
});

// Authenticated QR check-in with location validation
router.post('/attendance/qr-checkin', authenticate, qrCheckin);

export default router;
