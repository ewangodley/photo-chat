const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const adminRoutes = require('./routes/admin');
const { ipWhitelist, apiKeyAuth } = require('./middleware/security');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.set('trust proxy', 1);
app.use(ipWhitelist);
app.use(apiKeyAuth);

// CORS with restricted origins
app.use(cors({
  origin: process.env.ADMIN_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/admin', adminRoutes);

// Health check (fallback)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'admin-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong'
    }
  });
});

module.exports = app;