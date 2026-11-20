import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getProtectedTest } from '../controllers/authTestController.js';

const router = express.Router();

router.get('/protected-test', verifyToken(), getProtectedTest);

export default router;