const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for guest applications
    },
    jobTitle: { type: String, default: '' },

    // Personal Information
    name: { type: String, required: [true, 'Full name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },

    // Professional Links
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    github: { type: String, default: '' },
    dribbble: { type: String, default: '' },

    // Education
    education: [
      {
        qualification: { type: String, default: '' },
        university: { type: String, default: '' },
        field: { type: String, default: '' },
        year: { type: String, default: '' },
        cgpa: { type: String, default: '' },
      },
    ],

    // Work Experience
    employmentStatus: {
      type: String,
      enum: ['Fresher', 'Employed', 'Freelancer', 'Student'],
      default: 'Fresher',
    },
    hasWorked: { type: String, enum: ['Yes', 'No'], default: 'No' },
    currentCompany: { type: String, default: '' },
    currentRole: { type: String, default: '' },
    yearsOfExperience: { type: String, default: '' },
    responsibilities: { type: String, default: '' },

    // Skills
    primarySkills: [{ type: String }],
    skillExposureYears: { type: String, default: '' },

    // Documents
    resumeUrl: { type: String, required: [true, 'Resume URL is required'] },
    resumePublicId: { type: String, default: '' },
    coverLetter: { type: String, default: '' },

    // Screening Questions
    interestReason: { type: String, default: '' },
    strengthStatement: { type: String, default: '' },
    remoteComfortable: { type: String, enum: ['Yes', 'No'], default: 'Yes' },
    expectedSalary: { type: String, default: '' },
    noticePeriod: { type: String, default: 'Immediate' },

    // Application Status (for recruiter view)
    status: {
      type: String,
      enum: ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'],
      default: 'Applied',
    },

    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate applications per job per email
jobApplicationSchema.index({ jobId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
