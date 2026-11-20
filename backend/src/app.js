import express from 'express';
import cors from 'cors';
import authTestRoutes from './routes/authTestRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import testRoutes from './routes/testRoutes.js';

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:4173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (curl, server-to-server) are fine.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api/test', testRoutes);

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);

app.use('/api', authTestRoutes);

app.use(errorHandler);

export default app;
