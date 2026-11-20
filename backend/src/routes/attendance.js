import express from 'express';
import { getAttendance } from '../services/sheets.js';
import {
  getLiveAttendance,
  refreshLiveAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await getAttendance());
});

router.get("/live", getLiveAttendance);

router.post("/refresh", refreshLiveAttendance);

export default router;
