const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String, // e.g., 'profile_update', 'job_applied', 'resume_uploaded'
      required: true
    },
    category: {
      type: String, // e.g., 'Profile', 'Application', 'Resume'
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false // We use our own timestamp
  }
);

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
