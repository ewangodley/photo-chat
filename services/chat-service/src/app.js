const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const messageRoutes = require('./routes/messageRoutes');
const SocketHandler = require('./websocket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/chat/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chat-service',
    websocket: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/chat', messageRoutes);

// WebSocket handler
new SocketHandler(io);

module.exports = { app, server };