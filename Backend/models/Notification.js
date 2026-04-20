const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Application', 'Interview', 'Job', 'System', 'Announcement', 'Alert'],
      default: 'System'
    },
    read: {
      type: Boolean,
      default: false
    },
    link: String,
    targetRole: {
      type: String,
      enum: ['all', 'candidates', 'recruiters'],
      default: 'all'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
