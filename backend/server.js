import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', contactRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Vedanco API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact [POST, GET]',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const startServer = (port) => {
  const numericPort = Number(port);

  const server = app.listen(numericPort, () => {
    console.log(`[Vedanco Backend] Server listening on port ${numericPort}`);
    console.log(`[Vedanco Backend] Health endpoint: http://localhost:${numericPort}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = numericPort + 1;

      if (nextPort > 65535) {
        console.error('[Vedanco Backend] No free ports available in the valid range.');
        process.exit(1);
        return;
      }

      console.warn(`[Vedanco Backend] Port ${numericPort} is busy. Retrying on port ${nextPort}.`);
      startServer(nextPort);
      return;
    }

    console.error('[Vedanco Backend] Failed to start server:', err.message);
    process.exit(1);
  });
};

startServer(PORT);
