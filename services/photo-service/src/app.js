const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const photoRoutes = require('./routes/photos');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const photoCleanupJob = require('./jobs/photoCleanup');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// API key protection
app.use(apiKeyAuth);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Routes
app.use('/photos', photoRoutes);

// Manual cleanup endpoint for testing
app.post('/photos/cleanup', require('./middleware/auth').authenticateToken, async (req, res) => {
  try {
    await photoCleanupJob.cleanupExpiredPhotos();
    res.json({
      success: true,
      message: 'Photo cleanup completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CLEANUP_FAILED',
        message: 'Photo cleanup failed'
      }
    });
  }
});

// Start photo cleanup job
photoCleanupJob.start();

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = app;