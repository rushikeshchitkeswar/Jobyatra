const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    languageName: {
      type: String,
      required: true,
      trim: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'],
      default: 'Intermediate'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of language per user
languageSchema.index({ userId: 1, languageName: 1 }, { unique: true });

module.exports = mongoose.model('CandidateLanguage', languageSchema);
