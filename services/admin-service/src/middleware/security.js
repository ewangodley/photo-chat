const rateLimit = require('express-rate-limit');

// Rate limiting for admin endpoints
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many admin requests'
    }
  }
});

// Strict rate limiting for login attempts
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts'
    }
  }
});

// IP whitelist middleware (production should use environment variables)
const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || ['127.0.0.1', '::1'];
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (!allowedIPs.includes(clientIP) && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'IP_NOT_ALLOWED',
        message: 'Access denied from this IP'
      }
    });
  }
  next();
};

// API key validation
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-Admin-API-Key');
  const validApiKey = process.env.ADMIN_API_KEY;
  
  if (validApiKey && apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid or missing API key'
      }
    });
  }
  next();
};

module.exports = {
  adminRateLimit,
  loginRateLimit,
  ipWhitelist,
  apiKeyAuth
};