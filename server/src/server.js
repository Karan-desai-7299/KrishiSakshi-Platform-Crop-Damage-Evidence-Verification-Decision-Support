import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import clusterRoutes from './routes/clusterRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishisakshi';

import fs from 'fs';

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Flexible CORS for Local, Vercel, Render, and Production Hosting
const rawClientUrl = process.env.CLIENT_URL || '';
const configuredOrigins = rawClientUrl.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, mobile app)
    if (!origin) return callback(null, true);
    // Allow localhost and local IP in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    // Allow configured production URLs
    if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) return callback(null, true);
    // Allow standard cloud hosting domains (Vercel, Render, Netlify)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { message: 'Too many requests, please try again later.' }
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/demo', authRoutes);
app.use('/api', authRoutes);

// Database Connection with graceful fallback
let isDbConnected = false;
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  isDbConnected = true;
  console.log('[MongoDB] Connected successfully to:', MONGODB_URI);
})
.catch((err) => {
  isDbConnected = false;
  console.warn('[MongoDB] Connection warning (local MongoDB may not be active yet):', err.message);
});

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
});
mongoose.connection.on('connected', () => {
  isDbConnected = true;
});

// Phase 1 Health Route (format: { success, data, error })
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      app: 'KrishiSakshi Server',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: isDbConnected ? 'connected' : 'disconnected',
      phase: 'Phase 1 - Project Setup'
    },
    error: null
  });
});

// Production Unified Deployment: Serve built Vite client from client/dist
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // Express 5 compatible SPA fallback middleware
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
  console.log('[Production Mode] Serving frontend from:', clientDistPath);
}

app.listen(PORT, () => {
  console.log(`[KrishiSakshi Server] Running on http://localhost:${PORT}`);
});

export default app;
