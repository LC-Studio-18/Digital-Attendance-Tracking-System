import express from 'express';
import { getAttendance } from '../services/sheets.js';
const router = express.Router();

router.get('/api/attendance', async (req, res) => {
  res.json(await getAttendance());
});

export default router;