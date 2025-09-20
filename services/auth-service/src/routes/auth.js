const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  refresh,
  verifyTokenEndpoint,
  logout
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many registration attempts',
      details: { retryAfter: 60 }
    }
  }
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts',
      details: { retryAfter: 60 }
    }
  }
});

// Routes
router.post('/register', registerLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, login);
router.post('/refresh', refresh);
router.post('/verify-token', verifyTokenEndpoint);
router.post('/logout', authenticateToken, logout);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

module.exports = router;