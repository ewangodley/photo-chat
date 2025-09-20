const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');
const { adminRateLimit, loginRateLimit } = require('../middleware/security');

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(adminRateLimit);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'admin-service',
    timestamp: new Date().toISOString()
  });
});

// Admin authentication with strict rate limiting
router.post('/login', loginRateLimit, authController.login);
router.post('/logout', auth, authController.logout);

// User management
router.get('/users', auth, adminOnly, adminController.getUsers);
router.put('/users/:userId/status', auth, adminOnly, adminController.updateUserStatus);

// Photo moderation
router.get('/photos', auth, adminOnly, adminController.getPhotos);
router.put('/photos/:photoId/moderate', auth, adminOnly, adminController.moderatePhoto);

// Reports management
router.get('/reports', auth, adminOnly, adminController.getReports);
router.put('/reports/:reportId/resolve', auth, adminOnly, adminController.resolveReport);

// Analytics and monitoring
router.get('/analytics', auth, adminOnly, adminController.getAnalytics);
router.get('/logs', auth, adminOnly, adminController.getAuditLogs);

module.exports = router;