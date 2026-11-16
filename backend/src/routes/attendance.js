import express from 'express';
import { getAttendance } from '../services/sheets.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await getAttendance());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

export default router;