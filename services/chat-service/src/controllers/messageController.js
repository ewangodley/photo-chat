const Message = require('../models/Message');
const { publishMessage } = require('../utils/messageQueue');

class MessageController {
  async sendMessage(req, res) {
    try {
      const { recipientId, roomId, content, messageType = 'text' } = req.body;
      const senderId = req.user.id;

      const message = new Message({
        senderId,
        recipientId,
        roomId,
        content,
        messageType
      });

      await message.save();

      // Try real-time delivery
      const delivered = await publishMessage('user_online', {
        recipientId,
        messageId: message._id,
        message: {
          id: message._id,
          senderId,
          content,
          messageType,
          sentAt: message.sentAt
        }
      });

      res.status(201).json({
        success: true,
        data: {
          message: {
            id: message._id,
            recipientId,
            content,
            messageType,
            status: delivered ? 'delivered' : 'pending',
            sentAt: message.sentAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SEND_MESSAGE_FAILED',
          message: 'Failed to send message'
        }
      });
    }
  }

  async getPendingMessages(req, res) {
    try {
      const userId = req.user.id;

      const messages = await Message.find({
        recipientId: userId,
        status: 'pending'
      })
      .populate('senderId', 'username')
      .sort({ sentAt: 1 })
      .limit(100);

      res.json({
        success: true,
        data: {
          messages: messages.map(msg => ({
            id: msg._id,
            senderId: msg.senderId._id,
            senderUsername: msg.senderId.username,
            roomId: msg.roomId,
            content: msg.content,
            messageType: msg.messageType,
            sentAt: msg.sentAt
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PENDING_FAILED',
          message: 'Failed to get pending messages'
        }
      });
    }
  }

  async markDelivered(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findOneAndUpdate(
        { 
          _id: messageId, 
          recipientId: userId,
          status: 'pending'
        },
        { 
          status: 'delivered',
          deliveredAt: new Date()
        },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Message not found or already delivered'
          }
        });
      }

      res.json({
        success: true,
        data: {
          message: 'Message marked as delivered'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_DELIVERED_FAILED',
          message: 'Failed to mark message as delivered'
        }
      });
    }
  }

  async cleanupMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const result = await Message.deleteOne({
        _id: messageId,
        recipientId: userId,
        status: 'delivered'
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Message not found or not delivered'
          }
        });
      }

      res.json({
        success: true,
        data: {
          message: 'Message removed from server'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CLEANUP_FAILED',
          message: 'Failed to cleanup message'
        }
      });
    }
  }
}

module.exports = new MessageController();