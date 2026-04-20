const mongoose = require('mongoose');

// Register dependency models to ensure population works
require('./candidateEducation.model');
require('./candidateExperience.model');
require('./candidateProject.model');
require('./candidateSkill.model');
require('./candidateResume.model');
require('./candidateCertification.model');
require('./candidateLanguage.model');

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    professionalHeadline: {
      type: String,
      trim: true,
      default: ''
    },
    currentJobTitle: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    summary: { // Profile Summary / About Me
      type: String,
      trim: true,
      default: ''
    },
    careerObjective: {
      type: String,
      trim: true,
      default: ''
    },
    totalYearsOfExperience: {
      type: Number,
      default: 0
    },
    noticePeriod: {
      type: String,
      trim: true,
      default: ''
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: ''
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      website: String
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Virtuals to link normalized collections
candidateProfileSchema.virtual('education', {
    ref: 'CandidateEducation',
    localField: 'userId',
    foreignField: 'userId'
});

candidateProfileSchema.virtual('experience', {
    ref: 'CandidateExperience',
    localField: 'userId',
    foreignField: 'userId'
});

candidateProfileSchema.virtual('skills', {
    ref: 'CandidateSkill',
    localField: 'userId',
    foreignField: 'userId'
});

candidateProfileSchema.virtual('certifications', {
    ref: 'CandidateCertification',
    localField: 'userId',
    foreignField: 'userId'
});

candidateProfileSchema.virtual('projects', {
    ref: 'CandidateProject',
    localField: 'userId',
    foreignField: 'userId'
});

candidateProfileSchema.virtual('languages', {
    ref: 'CandidateLanguage',
    localField: 'userId',
    foreignField: 'userId'
});

candidateProfileSchema.virtual('resumes', {
    ref: 'CandidateResume',
    localField: 'userId',
    foreignField: 'userId'
});

// Set toObject and toJSON to include virtuals
candidateProfileSchema.set('toObject', { virtuals: true });
candidateProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.CandidateProfile || mongoose.model('CandidateProfile', candidateProfileSchema);
