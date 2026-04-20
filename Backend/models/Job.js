const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  salary: {
    type: String,
    required: [true, 'Please add a salary range'],
  },
  salaryValue: {
    type: Number,
    required: [true, 'Please add a numeric salary value for filtering'],
  },
  experience: {
    type: String,
    required: [true, 'Please add experience level'],
    enum: ['Fresher', '1-3 Years', '3-5 Years', '5+ Years', 'Any'],
    default: 'Any',
  },
  type: {
    type: String,
    required: [true, 'Please add job type'],
    enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote', 'Hybrid'],
    default: 'Full Time',
  },
  isRemote: {
    type: Boolean,
    default: false,
  },
  skills: {
    type: [String],
    required: [true, 'Please add at least one skill'],
  },
  description: {
    type: String,
    required: [true, 'Please add a job description'],
  },
  responsibilities: {
    type: [String],
    default: [],
  },
  requirements: {
    type: [String],
    default: [],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Closed', 'Draft'],
    default: 'Active',
  },
  recruiter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
