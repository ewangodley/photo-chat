const express = require('express');
const adminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

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