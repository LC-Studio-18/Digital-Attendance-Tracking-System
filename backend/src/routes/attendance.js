import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { qrCheckin } from '../controllers/attendanceController.js';
import { getMyDashboard } from '../controllers/attendanceController.js'
import { getAttendance } from '../services/sheets.js';
const router = express.Router();

router.post('/attendance/qr-checkin', authenticate, qrCheckin);
router.get('/attendance/me/dashboard', authenticate, getMyDashboard);

router.get('/', async (req, res) => {
  res.json(await getAttendance());
});

export default router;