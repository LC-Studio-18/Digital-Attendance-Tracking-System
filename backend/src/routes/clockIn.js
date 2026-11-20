import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { clockIn } from '../controllers/clockInController.js';

const router = express.Router();

router.post('/', verifyToken(), clockIn);

export default router;