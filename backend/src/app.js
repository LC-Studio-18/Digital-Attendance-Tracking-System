
import express from 'express';
import cors from 'cors';

// Import the application's route handlers.
import healthRoutes from './routes/healthRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

// Import the central error handler.
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configure CORS to allow requests from the frontend URL.
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

// Allow the application to receive and process JSON request bodies.
app.use(express.json());

// Register the health-check endpoints.
app.use('/api', healthRoutes);

// Register the attendance endpoints.
// Example: POST /api/attendance/clock-out
app.use('/api/attendance', attendanceRoutes);

// Handle errors passed from routes, controllers and services.
app.use(errorHandler);

// Export the Express application for use by the server.
export default app;
