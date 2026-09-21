import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  return res.status(error.status || 500).json({ error: 'Error interno del servidor.' });
});

export default app;
