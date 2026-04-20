const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    personalInfo: {
      jobTitle: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      bio: {
        type: String,
        trim: true
      },
      avatar: {
        type: String,
        default: ''
      }
    },
    companyInfo: {
      name: {
        type: String,
        trim: true
      },
      logo: {
        type: String,
        default: ''
      },
      website: {
        type: String,
        trim: true
      },
      industry: {
        type: String,
        trim: true
      },
      size: {
        type: String,
        trim: true
      },
      location: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    },
    socialLinks: {
      linkedin: {
        type: String,
        trim: true
      },
      twitter: {
        type: String,
        trim: true
      },
      website: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
