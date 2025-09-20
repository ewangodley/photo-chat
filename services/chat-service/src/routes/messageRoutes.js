const express = require('express');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/send', auth, messageController.sendMessage);
router.get('/pending', auth, messageController.getPendingMessages);
router.post('/delivered/:messageId', auth, messageController.markDelivered);
router.delete('/cleanup/:messageId', auth, messageController.cleanupMessage);

module.exports = router;