const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });

class MessageQueue {
  constructor() {
    this.onlineUsers = new Set();
    this.init();
  }

  async init() {
    await client.connect();
  }

  async publishMessage(channel, data) {
    try {
      await client.publish(channel, JSON.stringify(data));
      return this.onlineUsers.has(data.recipientId);
    } catch (error) {
      console.error('Failed to publish message:', error);
      return false;
    }
  }

  async subscribeToUserStatus() {
    const subscriber = client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe('user_status', (message) => {
      const { userId, status } = JSON.parse(message);
      
      if (status === 'online') {
        this.onlineUsers.add(userId);
        this.deliverPendingMessages(userId);
      } else {
        this.onlineUsers.delete(userId);
      }
    });
  }

  async deliverPendingMessages(userId) {
    try {
      const Message = require('../models/Message');
      
      const pendingMessages = await Message.find({
        recipientId: userId,
        status: 'pending'
      }).limit(50);

      for (const message of pendingMessages) {
        await this.publishMessage('message_delivery', {
          recipientId: userId,
          messageId: message._id,
          message: {
            id: message._id,
            senderId: message.senderId,
            content: message.content,
            messageType: message.messageType,
            sentAt: message.sentAt
          }
        });
      }
    } catch (error) {
      console.error('Failed to deliver pending messages:', error);
    }
  }

  setUserOnline(userId) {
    this.onlineUsers.add(userId);
    this.deliverPendingMessages(userId);
  }

  setUserOffline(userId) {
    this.onlineUsers.delete(userId);
  }
}

const messageQueue = new MessageQueue();

module.exports = {
  publishMessage: messageQueue.publishMessage.bind(messageQueue),
  setUserOnline: messageQueue.setUserOnline.bind(messageQueue),
  setUserOffline: messageQueue.setUserOffline.bind(messageQueue)
};