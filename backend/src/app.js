import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static images serving
app.use('/images', express.static(path.resolve(__dirname, '../../frontend/public/images')));

// 1. CORS setup (allows frontend Vite dev server, admin portal, and Netlify production client)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) or listed origins or netlify.app
    if (
      !origin ||
      env.isDev ||
      env.CORS_ORIGIN.includes('*') ||
      env.CORS_ORIGIN.includes(origin) ||
      (typeof origin === 'string' && (origin.endsWith('.netlify.app') || origin.includes('localhost')))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 2. Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Request logging
app.use(requestLogger);

// 4. Root welcome banner
app.get('/', (req, res) => {
  res.json({
    project: 'Bramarambika Home Foods REST API',
    status: 'Running',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 5. Mount API routes
app.use('/api', apiRouter);

// 6. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
