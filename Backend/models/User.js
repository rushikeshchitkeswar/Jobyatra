const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId; // Password required only if no Google ID
        },
        'Please add a password',
      ],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'recruiter', 'admin'],
      default: 'user',
    },
    // Recruiter-specific approval status (only meaningful when role === 'recruiter')
    recruiterStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
      default: 'Pending'
    },
    googleId: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: String,
    otpExpire: Date,
    recruiterVerified: {
      type: Boolean,
      default: false
    },
    // Recruiter-specific fields are now handled in the RecruiterProfile model
    // Candidate specific fields
    resume: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    portfolioLinks: [String],
    certifications: [String],
    profileViews: {
      type: Number,
      default: 0
    },
    profileComplete: {
      type: Number,
      default: 0
    },
    savedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }],
    profileImage: {
      type: String,
      default: ''
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending', 'rejected'],
      default: 'active'
    },
    preferences: {
      emailNotifications: {
        jobAlerts: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        interviews: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false }
      },
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
      }
    }
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt (Mongoose 9.x: async hooks must NOT call next())
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // just return — Mongoose awaits the promise, no next() needed
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
