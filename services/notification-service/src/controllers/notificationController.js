const Notification = require('../models/Notification');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const unreadCount = await Notification.countDocuments({ 
        userId, 
        read: false 
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          page: parseInt(page),
          totalPages: Math.ceil(await Notification.countDocuments({ userId }) / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_NOTIFICATIONS_FAILED',
          message: 'Failed to get notifications'
        }
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true }
      );

      res.json({
        success: true,
        data: { message: 'Notification marked as read' }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_READ_FAILED',
          message: 'Failed to mark notification as read'
        }
      });
    }
  }

  async sendNotification(req, res) {
    try {
      const { userId, type, title, message, data = {} } = req.body;

      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data
      });

      await notification.save();

      res.status(201).json({
        success: true,
        data: { notification }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SEND_NOTIFICATION_FAILED',
          message: 'Failed to send notification'
        }
      });
    }
  }
}

module.exports = new NotificationController();