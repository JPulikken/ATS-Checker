/**
 * ATS Resume Checker — Express Server Entry Point
 *
 * Configures middleware, routes, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const analyzeRoute = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// Ensure uploads directory exists
// =============================================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// =============================================================================
// Middleware
// =============================================================================

// CORS — allow frontend origins
// In development: allow any localhost port (handles Vite auto port-bumping 5173→5174 etc.)
// In production: restrict to CLIENT_URL env var
const isDev = process.env.NODE_ENV !== 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // In development, allow all localhost origins regardless of port
      if (isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // In production, check against CLIENT_URL
      const productionOrigin = process.env.CLIENT_URL;
      if (productionOrigin && origin === productionOrigin) {
        return callback(null, true);
      }

      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (simple)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// =============================================================================
// Routes
// =============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'ATS Resume Checker API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ai_enabled: !!process.env.OPENAI_API_KEY,
  });
});

// API routes
app.use('/api/analyze', analyzeRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// =============================================================================
// Start server
// =============================================================================
app.listen(PORT, () => {
  console.log(`\n✅ ATS Resume Checker API running on http://localhost:${PORT}`);
  console.log(`🔑 OpenAI AI Suggestions: ${process.env.OPENAI_API_KEY ? 'ENABLED' : 'DISABLED (set OPENAI_API_KEY to enable)'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}\n`);
});

module.exports = app;
