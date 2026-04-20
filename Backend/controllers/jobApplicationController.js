const asyncHandler = require('express-async-handler');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const { uploadFromBuffer } = require('../config/cloudinary');

// @desc    Submit a job application (Public)
// @route   POST /api/jobs/:id/apply
// @access  Public
exports.submitApplication = asyncHandler(async (req, res) => {
  const { id: jobId } = req.params;

  // ── 1. Verify the job exists ─────────────────────────────────────────────────
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // ── 2. Validate required text fields ────────────────────────────────────────
  const { name, email, phone, location } = req.body;
  if (!name || !email || !phone || !location) {
    res.status(400);
    throw new Error('Full name, email, phone and location are required');
  }

  // ── 3. Validate resume file ──────────────────────────────────────────────────
  if (!req.file) {
    res.status(400);
    throw new Error('Resume file is required (PDF or DOCX, max 5 MB)');
  }

  // ── 4. Check for duplicate application ──────────────────────────────────────
  const duplicate = await JobApplication.findOne({ jobId, email: email.toLowerCase().trim() });
  if (duplicate) {
    res.status(409);
    throw new Error('You have already applied for this position');
  }

  // ── 5. Upload resume to Cloudinary ──────────────────────────────────────────
  let resumeUrl = '';
  let resumePublicId = '';

  const safeFilename = `resume_${Date.now()}_${name.replace(/\s+/g, '_')}`;

  const uploadResult = await uploadFromBuffer(req.file.buffer, {
    folder: 'jobyatra/resumes',
    resource_type: 'raw',
    public_id: safeFilename,
    overwrite: false,
  });

  resumeUrl = uploadResult.secure_url;
  resumePublicId = uploadResult.public_id;

  // ── 6. Parse JSON-encoded array fields ──────────────────────────────────────
  let education = [];
  let primarySkills = [];

  try {
    if (req.body.education) education = JSON.parse(req.body.education);
  } catch (_) { education = []; }

  try {
    if (req.body.primarySkills) primarySkills = JSON.parse(req.body.primarySkills);
  } catch (_) { primarySkills = []; }

  // ── 7. Save application to MongoDB ──────────────────────────────────────────
  const candidateId = req.user ? req.user._id : null;

  const application = await JobApplication.create({
    jobId,
    candidateId,
    jobTitle: job.title || req.body.jobTitle || '',
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    location: location.trim(),
    linkedin: req.body.linkedin || '',
    portfolio: req.body.portfolio || '',
    github: req.body.github || '',
    dribbble: req.body.dribbble || '',
    education,
    employmentStatus: req.body.employmentStatus || 'Fresher',
    hasWorked: req.body.hasWorked || 'No',
    currentCompany: req.body.currentCompany || '',
    currentRole: req.body.currentRole || '',
    yearsOfExperience: req.body.yearsOfExperience || '',
    responsibilities: req.body.responsibilities || '',
    primarySkills,
    skillExposureYears: req.body.skillExposureYears || '',
    resumeUrl,
    resumePublicId,
    coverLetter: req.body.coverLetter || '',
    interestReason: req.body.interestReason || '',
    strengthStatement: req.body.strengthStatement || '',
    remoteComfortable: req.body.remoteComfortable || 'Yes',
    expectedSalary: req.body.expectedSalary || '',
    noticePeriod: req.body.noticePeriod || 'Immediate',
    status: 'Applied', 
  });

  // ── 8. Increment applicant count on the Job (best-effort) ───────────────────
  await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } }).catch(() => { });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      id: application._id,
      appliedAt: application.appliedAt,
    },
  });
});

// @desc    Get all applications for a job (Recruiter view)
// @route   GET /api/jobs/:id/applications
// @access  Private / Recruiter
exports.getApplicationsForJob = asyncHandler(async (req, res) => {
  const { id: jobId } = req.params;

  const applications = await JobApplication.find({ jobId })
    .select('-resumePublicId')
    .sort('-appliedAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});
