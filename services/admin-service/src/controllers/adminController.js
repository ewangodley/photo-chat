const AdminAction = require('../models/AdminAction');
const Report = require('../models/Report');

class AdminController {
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      
      // Mock user data - in real implementation, would query user service
      const users = [
        { id: '1', username: 'user1', email: 'user1@example.com', status: 'active', createdAt: new Date() },
        { id: '2', username: 'user2', email: 'user2@example.com', status: 'suspended', createdAt: new Date() }
      ];

      res.json({
        success: true,
        data: {
          users: users.slice(0, limit),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.length,
            totalPages: Math.ceil(users.length / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USERS_FAILED',
          message: 'Failed to get users'
        }
      });
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      if (!['active', 'suspended', 'banned'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Invalid user status'
          }
        });
      }

      // Log admin action
      const adminAction = new AdminAction({
        adminId: req.user.id,
        action: status === 'suspended' ? 'user_suspend' : status === 'banned' ? 'user_ban' : 'user_activate',
        targetType: 'user',
        targetId: userId,
        reason
      });
      await adminAction.save();

      res.json({
        success: true,
        data: {
          message: `User status updated to ${status}`,
          userId,
          status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_USER_STATUS_FAILED',
          message: 'Failed to update user status'
        }
      });
    }
  }

  async getPhotos(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      // Mock photo data - in real implementation, would query photo service
      const photos = [
        { id: '1', userId: '1', url: 'photo1.jpg', status: 'approved', uploadedAt: new Date() },
        { id: '2', userId: '2', url: 'photo2.jpg', status: 'pending', uploadedAt: new Date() }
      ];

      res.json({
        success: true,
        data: {
          photos: photos.slice(0, limit),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: photos.length,
            totalPages: Math.ceil(photos.length / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PHOTOS_FAILED',
          message: 'Failed to get photos'
        }
      });
    }
  }

  async moderatePhoto(req, res) {
    try {
      const { photoId } = req.params;
      const { action, reason } = req.body;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Invalid moderation action'
          }
        });
      }

      // Log admin action
      const adminAction = new AdminAction({
        adminId: req.user.id,
        action: action === 'approve' ? 'photo_approve' : 'photo_reject',
        targetType: 'photo',
        targetId: photoId,
        reason
      });
      await adminAction.save();

      res.json({
        success: true,
        data: {
          message: `Photo ${action}d successfully`,
          photoId,
          action
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MODERATE_PHOTO_FAILED',
          message: 'Failed to moderate photo'
        }
      });
    }
  }

  async getReports(req, res) {
    try {
      const { page = 1, limit = 20, status = 'pending' } = req.query;

      const reports = await Report.find({ status })
        .populate('reporterId', 'username')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Report.countDocuments({ status });

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_REPORTS_FAILED',
          message: 'Failed to get reports'
        }
      });
    }
  }

  async resolveReport(req, res) {
    try {
      const { reportId } = req.params;
      const { resolution, action } = req.body;

      const report = await Report.findByIdAndUpdate(
        reportId,
        {
          status: 'resolved',
          reviewedBy: req.user.id,
          resolution
        },
        { new: true }
      );

      if (!report) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'REPORT_NOT_FOUND',
            message: 'Report not found'
          }
        });
      }

      // Log admin action
      const adminAction = new AdminAction({
        adminId: req.user.id,
        action: 'report_resolve',
        targetType: 'report',
        targetId: reportId,
        reason: resolution,
        metadata: { action }
      });
      await adminAction.save();

      res.json({
        success: true,
        data: {
          message: 'Report resolved successfully',
          report
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'RESOLVE_REPORT_FAILED',
          message: 'Failed to resolve report'
        }
      });
    }
  }

  async getAnalytics(req, res) {
    try {
      const { period = '7d' } = req.query;

      // Mock analytics data
      const analytics = {
        users: {
          total: 1250,
          active: 980,
          suspended: 15,
          banned: 5,
          newToday: 23
        },
        photos: {
          total: 5420,
          pending: 12,
          approved: 5380,
          rejected: 28
        },
        reports: {
          total: 45,
          pending: 8,
          resolved: 35,
          dismissed: 2
        },
        activity: {
          period,
          logins: 1840,
          uploads: 156,
          messages: 2340
        }
      };

      res.json({
        success: true,
        data: { analytics }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_ANALYTICS_FAILED',
          message: 'Failed to get analytics'
        }
      });
    }
  }

  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;

      const logs = await AdminAction.find()
        .populate('adminId', 'username')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AdminAction.countDocuments();

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_AUDIT_LOGS_FAILED',
          message: 'Failed to get audit logs'
        }
      });
    }
  }
}

module.exports = new AdminController();