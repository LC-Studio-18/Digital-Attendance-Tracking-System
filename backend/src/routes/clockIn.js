import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { clockIn } from '../controllers/clockInController.js';

const router = express.Router();

router.post('/', verifyToken, clockIn);

export default router;