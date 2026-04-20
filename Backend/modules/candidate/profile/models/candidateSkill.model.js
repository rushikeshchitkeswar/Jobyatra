const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skillName: {
      type: String,
      required: true,
      trim: true
    },
    skillType: {
      type: String,
      enum: ['Technical', 'Soft'],
      default: 'Technical'
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Intermediate'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of skill per user
skillSchema.index({ userId: 1, skillName: 1 }, { unique: true });

module.exports = mongoose.models.CandidateSkill || mongoose.model('CandidateSkill', skillSchema);
