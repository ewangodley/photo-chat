const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['user_suspend', 'user_ban', 'user_activate', 'photo_approve', 'photo_reject', 'photo_delete', 'report_resolve'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'photo', 'report'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    maxlength: 500
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

adminActionSchema.index({ adminId: 1, createdAt: -1 });
adminActionSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminAction', adminActionSchema);