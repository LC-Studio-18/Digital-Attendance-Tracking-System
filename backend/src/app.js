import attendanceRoutes from './routes/attendance.js';
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());

app.use('/api/v1/attendance', attendanceRoutes);

app.use('/api', healthRoutes);

app.use(errorHandler);

export default app;
