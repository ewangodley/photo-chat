const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/block', auth, userController.blockUser);
router.post('/unblock', auth, userController.unblockUser);

module.exports = router;