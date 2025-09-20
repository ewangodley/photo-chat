const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP',
      timestamp: new Date().toISOString()
    }
  }
});

app.use(globalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy
app.set('trust proxy', 1);

// Service proxy configurations
const serviceProxies = {
  '/api/auth': {
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' }
  },
  '/api/photos': {
    target: process.env.PHOTO_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/photos': '/photos' }
  },
  '/api/chat': {
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '/chat' }
  },
  '/api/users': {
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' }
  },
  '/api/notifications': {
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/notifications': '/notifications' }
  },
  '/api/admin': {
    target: process.env.ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/admin': '/admin' }
  }
};

// Create proxy middleware for each service
Object.entries(serviceProxies).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware({
    ...config,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${path}:`, err.message);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service temporarily unavailable',
          timestamp: new Date().toISOString()
        }
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add request ID for tracing
      proxyReq.setHeader('X-Request-ID', require('uuid').v4());
      // Add API key for backend services
      if (path.includes('/admin')) {
        proxyReq.setHeader('X-Admin-API-Key', process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production');
      } else {
        proxyReq.setHeader('X-API-Key', process.env.API_KEY || 'phone-app-api-key-change-in-production');
      }
    }
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Phone App API Gateway',
    version: '1.0.0',
    services: {
      auth: '/api/auth',
      photos: '/api/photos',
      chat: '/api/chat',
      users: '/api/users',
      notifications: '/api/notifications',
      admin: '/api/admin'
    },
    documentation: 'See API_CONTRACTS.md for detailed API documentation'
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Gateway error',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = app;