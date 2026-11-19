import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import testRoutes from "./routes/testRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());

app.use("/api/test", testRoutes);

app.use('/api', healthRoutes);

app.use(errorHandler);

export default app;