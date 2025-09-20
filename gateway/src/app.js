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

// Disable rate limiting for debugging
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // 1000 requests per 15 minutes per IP
//   message: {
//     success: false,
//     error: {
//       code: 'RATE_LIMIT_EXCEEDED',
//       message: 'Too many requests from this IP',
//       timestamp: new Date().toISOString()
//     }
//   }
// });

// app.use(globalLimiter);

// Trust proxy
app.set('trust proxy', 1);

// API Key validation middleware
app.use((req, res, next) => {
  // Skip API key check for health endpoint
  if (req.path === '/health' || req.path === '/api') {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'phone-app-api-key-change-in-production';
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid or missing API key'
      }
    });
  }
  
  console.log(`${req.method} ${req.path} - API key valid`);
  next();
});

// Body parsing after API key validation
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Service proxy configurations
const serviceProxies = {
  '/auth': {
    target: 'http://auth-service:3001',
    changeOrigin: true,
    timeout: 5000,
    proxyTimeout: 5000
  },
  '/api/auth': {
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' }
  },
  '/photos': {
    target: 'http://photo-service:3002',
    changeOrigin: true
  },
  '/chat': {
    target: 'http://chat-service:3003',
    changeOrigin: true
  },
  '/users': {
    target: 'http://user-service:3004',
    changeOrigin: true
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

// Fixed proxy with proper stream handling
app.use('/auth', createProxyMiddleware({
  target: 'http://auth-service:3001',
  changeOrigin: true,
  timeout: 10000,
  proxyTimeout: 10000,
  onProxyReq: (proxyReq, req, res) => {
    // Set API key
    proxyReq.setHeader('X-API-Key', 'phone-app-api-key-change-in-production');
    
    // Fix stream consumption issue for POST requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(503).json({ success: false, error: { message: 'Service unavailable' } });
    }
  }
}));

// Create proxy middleware for other services
Object.entries(serviceProxies).forEach(([path, config]) => {
  if (path === '/auth') return; // Skip auth, handled above
  
  app.use(path, createProxyMiddleware({
    ...config,
    timeout: 10000,
    proxyTimeout: 10000,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${path}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable',
            timestamp: new Date().toISOString()
          }
        });
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