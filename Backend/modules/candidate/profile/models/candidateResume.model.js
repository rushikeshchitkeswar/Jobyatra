const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeName: {
      type: String,
      required: true,
      trim: true
    },
    resumeUrl: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    fileSize: {
      type: Number // in bytes
    },
    fileType: {
      type: String,
      default: 'application/pdf'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.CandidateResume || mongoose.model('CandidateResume', resumeSchema);
