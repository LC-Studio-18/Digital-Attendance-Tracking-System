import express from 'express';
import { getAttendance } from '../services/sheets.js';
const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await getAttendance());
});

export default router;