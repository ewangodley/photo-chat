const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  uploadPhoto,
  getNearbyPhotos,
  deletePhoto,
  getUserPhotos
} = require('../controllers/photoController');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Upload limit exceeded. Maximum 10 uploads per hour.',
      details: { retryAfter: 3600 }
    }
  }
});

const queryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 queries per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Query limit exceeded. Maximum 100 requests per hour.',
      details: { retryAfter: 3600 }
    }
  }
});

// Routes
router.post('/upload', 
  authenticateToken, 
  uploadLimiter, 
  upload, 
  handleUploadError, 
  uploadPhoto
);

router.get('/nearby', 
  authenticateToken, 
  queryLimiter, 
  getNearbyPhotos
);

router.get('/my-photos', 
  authenticateToken, 
  queryLimiter, 
  getUserPhotos
);

router.delete('/:id', 
  authenticateToken, 
  deletePhoto
);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'photo-service' });
});

module.exports = router;