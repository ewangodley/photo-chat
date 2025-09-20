const UserProfile = require('../models/UserProfile');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      let profile = await UserProfile.findOne({ userId });
      
      if (!profile) {
        profile = new UserProfile({ userId });
        await profile.save();
      }

      res.json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PROFILE_FAILED',
          message: 'Failed to get user profile'
        }
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { displayName, bio, location, preferences } = req.body;

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { displayName, bio, location, preferences },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_PROFILE_FAILED',
          message: 'Failed to update profile'
        }
      });
    }
  }

  async blockUser(req, res) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.body;

      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_OPERATION',
            message: 'Cannot block yourself'
          }
        });
      }

      await UserProfile.findOneAndUpdate(
        { userId },
        { $addToSet: { blockedUsers: targetUserId } },
        { upsert: true }
      );

      res.json({
        success: true,
        data: { message: 'User blocked successfully' }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'BLOCK_USER_FAILED',
          message: 'Failed to block user'
        }
      });
    }
  }

  async unblockUser(req, res) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.body;

      await UserProfile.findOneAndUpdate(
        { userId },
        { $pull: { blockedUsers: targetUserId } }
      );

      res.json({
        success: true,
        data: { message: 'User unblocked successfully' }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UNBLOCK_USER_FAILED',
          message: 'Failed to unblock user'
        }
      });
    }
  }
}

module.exports = new UserController();