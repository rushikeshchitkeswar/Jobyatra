const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    filters: {
      search: String,
      location: String,
      type: [String],
      salary: Number,
      experience: String
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      default: 'Daily'
    },
    status: {
      type: String,
      enum: ['Active', 'Paused'],
      default: 'Active'
    },
    lastSent: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JobAlert', jobAlertSchema);
