import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import attendanceRoutes from './routes/attendance.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());

app.use('/api', healthRoutes);

app.use(errorHandler);


app.use('/api', attendanceRoutes);

export default app;