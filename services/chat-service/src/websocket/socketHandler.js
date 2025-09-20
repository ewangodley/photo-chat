const jwt = require('jsonwebtoken');
const { setUserOnline, setUserOffline } = require('../utils/messageQueue');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.id;
        socket.username = decoded.username;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      
      socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  handleConnection(socket) {
    this.connectedUsers.set(socket.userId, socket.id);
    setUserOnline(socket.userId);
    
    socket.emit('connected', {
      userId: socket.userId
    });
  }

  handleJoinRoom(socket, data) {
    const { roomId } = data;
    socket.join(roomId);
    socket.emit('joined_room', { roomId });
  }

  handleSendMessage(socket, data) {
    const { roomId, recipientId, content } = data;
    
    const messageData = {
      id: Date.now().toString(),
      senderId: socket.userId,
      senderUsername: socket.username,
      recipientId,
      roomId,
      content,
      sentAt: new Date().toISOString()
    };

    if (roomId) {
      socket.to(roomId).emit('new_message', messageData);
    }
    
    if (recipientId && this.connectedUsers.has(recipientId)) {
      const recipientSocketId = this.connectedUsers.get(recipientId);
      this.io.to(recipientSocketId).emit('new_message', messageData);
    }

    socket.emit('message_sent', { messageId: messageData.id });
  }

  handleDisconnect(socket) {
    this.connectedUsers.delete(socket.userId);
    setUserOffline(socket.userId);
  }
}

module.exports = SocketHandler;