const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    interviewDate: {
      type: Date,
      required: true
    },
    interviewType: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online'
    },
    interviewStatus: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled'
    },
    meetingLink: String,
    location: String,
    notes: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
