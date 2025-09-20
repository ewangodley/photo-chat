const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  },
  displayName: {
    type: String,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500
  },
  profilePicture: {
    type: String, // URL to profile picture
    default: null
  },
  location: {
    city: String,
    country: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      chat: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      locationVisible: { type: Boolean, default: true }
    }
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

userProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);