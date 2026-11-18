import express from 'express';
import { appendAttendanceRow } from '../services/sheets.js';
import { verifyFirebaseToken } from '../middleware/authorization.js';

const router = express.Router();

router.post('/check-in', verifyFirebaseToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { uid, name } = req.user;

    if(!['IN', 'OUT'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "IN" or "OUT".' });
    }

    const timestamp = new Date().toISOString();

    await appendAttendanceRow({ userID: uid, name, status, timestamp });

    res.status(200).json({ success: true, message: `Check ${status === 'IN' ? 'in' : 'OUT'} successful.` });
  } catch (error) {
    console.error('Error checking in attendance:', error);
    res.status(409).json({ message: 'Internal server error.' });
  }
});

export default router;