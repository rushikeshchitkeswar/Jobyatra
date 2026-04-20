const CandidateProfile = require('../../modules/candidate/profile/models/candidateProfile.model');
const CandidateResume = require('../../modules/candidate/profile/models/candidateResume.model');
const CandidateEducation = require('../../modules/candidate/profile/models/candidateEducation.model');
const CandidateExperience = require('../../modules/candidate/profile/models/candidateExperience.model');
const CandidateProject = require('../../modules/candidate/profile/models/candidateProject.model');
const CandidateSkill = require('../../modules/candidate/profile/models/candidateSkill.model');
const CandidateCertification = require('../../modules/candidate/profile/models/candidateCertification.model');
const CandidateLanguage = require('../../modules/candidate/profile/models/candidateLanguage.model');

const JobAlert = require('../models/JobAlert');
const Application = require('../../models/Application');
const Job = require('../../models/Job');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const Interview = require('../../models/Interview');
const JobApplication = require('../../models/JobApplication');
const SavedJob = require('../../models/SavedJob');
const asyncHandler = require('express-async-handler');
const { calculateCompletionPercentage, formatDashboardStats } = require('../services/candidateService');
const { logActivity } = require('../services/activityService');
const { uploadFromBuffer } = require('../../config/cloudinary');

// @desc    Get current candidate profile (fully populated)
// @route   GET /api/candidate/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  let profile = await CandidateProfile.findOne({ userId: req.user._id })
    .populate('userId', 'name email role')
    .populate({ path: 'education', options: { sort: { startDate: -1 } } })
    .populate({ path: 'experience', options: { sort: { startDate: -1 } } })
    .populate('skills')
    .populate('projects')
    .populate('languages')
    .populate('certifications')
    .populate('resumes');

  if (!profile) {
    profile = await CandidateProfile.create({
      userId: req.user._id,
      fullName: req.user.name || '',
      email: req.user.email || '',
    });
  }

  // Calculate latest completion and missing sections on the fly
  const { percentage, missingSections } = calculateCompletionPercentage(profile);
  
  // Persist percentage if it changed
  if (profile.completionPercentage !== percentage) {
    profile.completionPercentage = percentage;
    await profile.save();
  }

  res.status(200).json({
    success: true,
    data: {
      ...profile.toJSON(),
      missingSections
    }
  });
});

// @desc    Update candidate profile basic info
// @route   PUT /api/candidate/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const {
    professionalHeadline,
    summary,
    careerObjective,
    totalYearsOfExperience,
    location,
    phone,
    socialLinks,
    profilePhoto,
    noticePeriod,
    portfolioUrl
  } = req.body;

  let profile = await CandidateProfile.findOne({ userId: req.user._id });

  if (!profile) {
    profile = new CandidateProfile({ userId: req.user._id });
  }

  // Update fields
  profile.professionalHeadline = professionalHeadline || profile.professionalHeadline;
  profile.summary = summary || profile.summary;
  profile.careerObjective = careerObjective || profile.careerObjective;
  profile.totalYearsOfExperience = totalYearsOfExperience !== undefined ? totalYearsOfExperience : profile.totalYearsOfExperience;
  profile.location = location || profile.location;
  profile.phone = phone || profile.phone;
  profile.noticePeriod = noticePeriod || profile.noticePeriod;
  profile.portfolioUrl = portfolioUrl || profile.portfolioUrl;

  if (socialLinks) {
    profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
  }

  profile.profilePhoto = profilePhoto || profile.profilePhoto;

  // Recalculate completion and save
  const { percentage } = calculateCompletionPercentage(profile);
  profile.completionPercentage = percentage;
  await profile.save();

  // 1. Sync name and profileImage with User model
  const userUpdate = {};
  if (req.body.fullName) userUpdate.name = req.body.fullName;
  if (profile.profilePhoto) userUpdate.profileImage = profile.profilePhoto;

  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(req.user._id, userUpdate);
  }

  // Log Activity
  await logActivity(req.user._id, 'profile_update', 'Profile', 'Updated basic profile information');

  res.status(200).json({
    success: true,
    data: profile
  });
});

// --- EDUCATION CRUD ---

exports.addEducation = asyncHandler(async (req, res) => {
  const education = await CandidateEducation.create({
    ...req.body,
    userId: req.user._id
  });

  await logActivity(req.user._id, 'education_add', 'Profile', `Added education: ${education.degree}`);

  // Trigger profile completion recalculation if needed
  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (profile) {
    const { percentage } = calculateCompletionPercentage(profile);
    profile.completionPercentage = percentage;
    await profile.save();
  }

  res.status(201).json({ success: true, data: education });
});

exports.updateEducation = asyncHandler(async (req, res) => {
  const education = await CandidateEducation.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!education) {
    res.status(404);
    throw new Error('Education entry not found');
  }

  await logActivity(req.user._id, 'education_update', 'Profile', `Updated education: ${education.degree}`);
  res.status(200).json({ success: true, data: education });
});

exports.deleteEducation = asyncHandler(async (req, res) => {
  const education = await CandidateEducation.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!education) {
    res.status(404);
    throw new Error('Education entry not found');
  }

  await logActivity(req.user._id, 'education_delete', 'Profile', `Deleted education entry`);
  res.status(200).json({ success: true, data: {} });
});

// --- EXPERIENCE CRUD ---

exports.addExperience = asyncHandler(async (req, res) => {
  const experience = await CandidateExperience.create({
    ...req.body,
    userId: req.user._id
  });

  await logActivity(req.user._id, 'experience_add', 'Profile', `Added experience at ${experience.companyName}`);

  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (profile) {
    const { percentage } = calculateCompletionPercentage(profile);
    profile.completionPercentage = percentage;
    await profile.save();
  }

  res.status(201).json({ success: true, data: experience });
});

exports.updateExperience = asyncHandler(async (req, res) => {
  const experience = await CandidateExperience.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!experience) {
    res.status(404);
    throw new Error('Experience entry not found');
  }

  await logActivity(req.user._id, 'experience_update', 'Profile', `Updated experience at ${experience.companyName}`);
  res.status(200).json({ success: true, data: experience });
});

exports.deleteExperience = asyncHandler(async (req, res) => {
  const experience = await CandidateExperience.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!experience) {
    res.status(404);
    throw new Error('Experience entry not found');
  }

  await logActivity(req.user._id, 'experience_delete', 'Profile', `Removed experience entry`);
  res.status(200).json({ success: true, data: {} });
});

// --- PROJECTS CRUD ---

exports.addProject = asyncHandler(async (req, res) => {
  const project = await CandidateProject.create({
    ...req.body,
    userId: req.user._id
  });

  await logActivity(req.user._id, 'project_add', 'Profile', `Launched new project: ${project.projectName}`);

  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (profile) {
    const { percentage } = calculateCompletionPercentage(profile);
    profile.completionPercentage = percentage;
    await profile.save();
  }

  res.status(201).json({ success: true, data: project });
});

exports.updateProject = asyncHandler(async (req, res) => {
  const project = await CandidateProject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await logActivity(req.user._id, 'project_update', 'Profile', `Updated project: ${project.projectName}`);
  res.status(200).json({ success: true, data: project });
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await CandidateProject.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await logActivity(req.user._id, 'project_delete', 'Profile', `Removed project entry`);
  res.status(200).json({ success: true, data: {} });
});

// --- SKILLS & MISC ---

exports.updateSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;
  const profile = await CandidateProfile.findOne({ userId: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  // Handle skills as either references or embedded depending on implementation
  // For production, we'll store them as separate docs for detailed management
  if (Array.isArray(skills)) {
    // Bulk update skills logic
    await CandidateSkill.deleteMany({ userId: req.user._id });
    const skillDocs = skills.map(s => ({ ...s, userId: req.user._id }));
    await CandidateSkill.insertMany(skillDocs);
  }

  const { percentage } = calculateCompletionPercentage(profile);
  profile.completionPercentage = percentage;
  await profile.save();

  await logActivity(req.user._id, 'skills_update', 'Profile', 'Refined technical arsenal');

  res.status(200).json({
    success: true,
    data: skills
  });
});

// --- RESUME MANAGEMENT ---

exports.uploadResume = asyncHandler(async (req, res) => {
  const { resumeName, resumeUrl, fileSize, fileType } = req.body;

  if (!resumeUrl) {
    res.status(400);
    throw new Error('Resume URL is required');
  }

  const resume = await CandidateResume.create({
    userId: req.user._id,
    resumeName: resumeName || 'My Resume',
    resumeUrl,
    fileSize,
    fileType: fileType || 'application/pdf'
  });

  // If it's the first resume, make it default
  const count = await CandidateResume.countDocuments({ userId: req.user._id });
  if (count === 1) {
    await CandidateResume.findByIdAndUpdate(resume._id, { isDefault: true });
  }

  await logActivity(req.user._id, 'resume_upload', 'Resume', `Uploaded resume: ${resume.resumeName}`);

  res.status(201).json({
    success: true,
    data: resume
  });
});

exports.deleteResume = asyncHandler(async (req, res) => {
  const resume = await CandidateResume.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  await logActivity(req.user._id, 'resume_delete', 'Resume', `Removed resume: ${resume.resumeName}`);

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getResumes = asyncHandler(async (req, res) => {
  const resumes = await CandidateResume.find({ userId: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: resumes.length, data: resumes });
});

// --- DASHBOARD & ANALYTICS ---

// @desc    Upload profile photo to Cloudinary
// @route   POST /api/candidate/profile/photo
// @access  Private
exports.uploadCandidatePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a photo');
  }

  try {
    // 1. Upload to Cloudinary using buffer stream
    const result = await uploadFromBuffer(req.file.buffer, {
      folder: 'jobyatra/profiles',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' }, // Enforce size limit
        { quality: 'auto' }
      ]
    });

    // 2. Update candidate profile in DB
    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: req.user._id },
      { profilePhoto: result.secure_url },
      { new: true, runValidators: true }
    );

    if (!profile) {
      res.status(404);
      throw new Error('Candidate profile not found');
    }

    // 3. Recalculate completion percentage
    const { percentage } = calculateCompletionPercentage(profile);
    profile.completionPercentage = percentage;
    await profile.save();

    // 4. Update User model's profileImage to keep in sync
    await User.findByIdAndUpdate(req.user._id, { profileImage: result.secure_url });

    // 5. Log activity
    await logActivity(req.user._id, 'profile_photo_update', 'Profile', 'Updated profile photo');

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const applications = await JobApplication.find({ candidateId: req.user._id });
  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  const savedJobsCount = await SavedJob.countDocuments({ candidateId: req.user._id });

  const stats = formatDashboardStats(applications, Array(savedJobsCount).fill({}));

  res.status(200).json({
    success: true,
    data: {
      stats,
      completionPercentage: profile ? profile.completionPercentage : 0
    }
  });
});

exports.getAppliedJobs = asyncHandler(async (req, res) => {
  const applications = await JobApplication.find({ candidateId: req.user._id })
    .populate({
      path: 'jobId',
      select: 'title company logo location type salary'
    })
    .sort('-createdAt');

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

exports.toggleSaveJob = asyncHandler(async (req, res) => {
  const jobId = req.body.jobId || req.params.jobId || req.params.id;
  const candidateId = req.user._id;

  if (!jobId) {
    res.status(400);
    throw new Error('Job ID is required');
  }

  const existingSave = await SavedJob.findOne({ candidateId, jobId });

  if (existingSave) {
    await SavedJob.deleteOne({ _id: existingSave._id });
    await logActivity(candidateId, 'job_unsave', 'Job', `Unsaved job: ${jobId}`);

    return res.status(200).json({
      success: true,
      isSaved: false,
      message: 'Job removed from saved list'
    });
  } else {
    await SavedJob.create({ candidateId, jobId });
    await logActivity(candidateId, 'job_save', 'Job', `Saved job for later: ${jobId}`);

    return res.status(200).json({
      success: true,
      isSaved: true,
      message: 'Job saved successfully'
    });
  }
});

exports.getSavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await SavedJob.find({ candidateId: req.user._id })
    .populate({
      path: 'jobId',
      select: 'title company logo location type salary status'
    })
    .sort('-createdAt');

  const formattedJobs = savedJobs.map(item => item.jobId).filter(Boolean);
  res.status(200).json({ success: true, data: formattedJobs, count: formattedJobs.length });
});

exports.getRecommendedJobs = asyncHandler(async (req, res) => {
  // Logic remains mostly consistent but can be optimized with more complex matching
  const profile = await CandidateProfile.findOne({ userId: req.user._id }).populate('skills');
  const skills = profile && profile.skills ? profile.skills.map(s => s.skillName) : [];

  if (skills.length === 0) {
    const jobs = await Job.find({ status: 'Active' }).sort('-createdAt').limit(4);
    return res.status(200).json({ success: true, data: jobs.map(j => ({ ...j._doc, match: 50 })) });
  }

  const matchingJobs = await Job.find({ status: 'Active', skills: { $in: skills } }).limit(10);
  const jobsWithMatch = matchingJobs.map(job => {
    const common = job.skills.filter(s => skills.includes(s));
    return { ...job._doc, match: Math.round((common.length / job.skills.length) * 100) };
  }).sort((a, b) => b.match - a.match);

  res.status(200).json({ success: true, data: jobsWithMatch });
});

exports.getJobAlerts = asyncHandler(async (req, res) => {
  const alerts = await JobAlert.find({ userId: req.user._id });
  res.status(200).json({ success: true, data: alerts });
});

exports.createJobAlert = asyncHandler(async (req, res) => {
  const alert = await JobAlert.create({ ...req.body, userId: req.user._id });
  await logActivity(req.user._id, 'alert_create', 'Job', `Created job alert for: ${alert.keyword || alert.category}`);
  res.status(201).json({ success: true, data: alert });
});

exports.deleteJobAlert = asyncHandler(async (req, res) => {
  const alert = await JobAlert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }
  res.status(200).json({ success: true, data: {} });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id }).sort('-createdAt').limit(20);
  res.status(200).json({ success: true, data: notifications });
});

exports.getCandidateInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ studentId: req.user._id })
    .populate('jobId', 'title company logo location salary')
    .populate('recruiterId', 'name companyName companyLogo')
    .sort({ interviewDate: 1 });
  res.status(200).json({ success: true, count: interviews.length, data: interviews });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  // Analytics logic remains consistent but now reflects more real-world activity
  const applications = await JobApplication.find({ candidateId: req.user._id }).populate('jobId');
  const total = applications.length;

  // Monthly breakdown
  const monthlyData = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(m => monthlyData[m] = 0);
  applications.forEach(a => {
    const m = months[new Date(a.createdAt).getMonth()];
    monthlyData[m]++;
  });
  const applicationsPerMonth = Object.entries(monthlyData).map(([name, apps]) => ({ name, apps }));

  // Status breakdown
  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  res.status(200).json({
    success: true,
    data: {
      applicationsPerMonth,
      statusData,
      totalApplications: total,
      interviewRate: total > 0 ? Math.round((applications.filter(a => a.status === 'Interview').length / total) * 100) : 0
    }
  });
});

exports.getInsights = asyncHandler(async (req, res) => {
  const applications = await JobApplication.find({ candidateId: req.user._id });
  const profile = await CandidateProfile.findOne({ userId: req.user._id });

  const insights = [];
  if (applications.length > 0) {
    insights.push({ id: 1, type: 'info', icon: 'Briefcase', text: `Active search: ${applications.length} applications submitted.` });
  }

  const completion = profile ? profile.completionPercentage : 0;
  if (completion < 80) {
    insights.push({ id: 2, type: 'tip', icon: 'User', text: `Boost your visibility: Complete your profile to reach 90%+ strength.` });
  }

  res.status(200).json({ success: true, data: insights });
});

// --- LANGUAGES ---

exports.addLanguage = asyncHandler(async (req, res) => {
  const language = await CandidateLanguage.create({
    ...req.body,
    userId: req.user._id
  });

  await logActivity(req.user._id, 'language_add', 'Profile', `Added language: ${language.languageName}`);

  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (profile) {
    const { percentage } = calculateCompletionPercentage(profile);
    profile.completionPercentage = percentage;
    await profile.save();
  }

  res.status(201).json({ success: true, data: language });
});

exports.deleteLanguage = asyncHandler(async (req, res) => {
  const language = await CandidateLanguage.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!language) {
    res.status(404);
    throw new Error('Language not found');
  }

  await logActivity(req.user._id, 'language_delete', 'Profile', `Removed language entry`);
  res.status(200).json({ success: true, data: {} });
});

// --- CERTIFICATIONS ---

exports.addCertification = asyncHandler(async (req, res) => {
  const certification = await CandidateCertification.create({
    ...req.body,
    userId: req.user._id
  });

  await logActivity(req.user._id, 'certification_add', 'Profile', `Added certification: ${certification.certificationName}`);

  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (profile) {
    const { percentage } = calculateCompletionPercentage(profile);
    profile.completionPercentage = percentage;
    await profile.save();
  }

  res.status(201).json({ success: true, data: certification });
});

exports.deleteCertification = asyncHandler(async (req, res) => {
  const certification = await CandidateCertification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!certification) {
    res.status(404);
    throw new Error('Certification not found');
  }

  await logActivity(req.user._id, 'certification_delete', 'Profile', `Removed certification entry`);
  res.status(200).json({ success: true, data: {} });
});
