const express = require('express');
const router = express.Router();

// Mock chat data
const chatRooms = [];
const messages = [];

// GET /api/chat/rooms
router.get('/rooms', (req, res) => {
  res.json(chatRooms);
});

// GET /api/chat/messages/:roomId
router.get('/messages/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const roomMessages = messages.filter(m => m.roomId === roomId);
  res.json(roomMessages);
});

// POST /api/chat/send
router.post('/send', (req, res) => {
  const message = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  messages.push(message);
  res.json(message);
});

module.exports = router;