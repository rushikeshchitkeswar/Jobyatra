const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Interview = require('../models/Interview');
const RecruiterProfile = require('../models/RecruiterProfile');
const asyncHandler = require('express-async-handler');

// Helper to calculate common recruiter stats
const getRecruiterStatsHelper = async (recruiterId) => {
  // console.log(`DEBUG: Stats Helper Called for Recruiter: ${recruiterId}`);
  const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
  const jobIds = recruiterJobs.map(j => j._id);
  // console.log(`DEBUG: Found ${jobIds.length} job IDs for this recruiter`);

  const activeJobs = await Job.countDocuments({ recruiter: recruiterId });
  const totalApplicants = await JobApplication.countDocuments({ jobId: { $in: jobIds } });
  const shortlistedCount = await JobApplication.countDocuments({ jobId: { $in: jobIds }, status: 'Shortlisted' });
  const interviewsCount = await Interview.countDocuments({ recruiterId, interviewStatus: 'Scheduled' });
  const totalHires = await JobApplication.countDocuments({ jobId: { $in: jobIds }, status: 'Hired' });

  return { activeJobs, totalApplicants, shortlistedCount, interviewsCount, totalHires, jobIds };
};

// @desc    Get recruiter dashboard stats
// @route   GET /api/recruiter/stats
// @access  Private/Recruiter
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;

  const { activeJobs, totalApplicants, shortlistedCount, interviewsCount, totalHires, jobIds } = await getRecruiterStatsHelper(recruiterId);

  // Weekly applications trend - Real aggregation for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendData = await JobApplication.aggregate([
    {
      $match: {
        jobId: { $in: jobIds },
        appliedAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const applicationsTrend = last7Days.map(date => {
    const match = trendData.find(t => t._id === date);
    return { name: date.split('-').slice(1).join('/'), count: match ? match.count : 0 }; // Format for UI
  });

  // Additional data for dashboard charts
  const pipelineDistribution = await JobApplication.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$status', value: { $sum: 1 } } },
    { $project: { name: '$_id', value: 1, _id: 0 } }
  ]);

  const applicationsByJob = await JobApplication.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } },
    { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
    { $unwind: '$job' },
    { $project: { name: '$job.title', applicants: '$count', _id: 0 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      activeJobs,
      totalApplicants,
      shortlistedCount,
      interviewsCount,
      totalHires,
      applicationsTrend,
      pipelineDistribution,
      applicationsByJob
    }
  });
});

// @desc    Get recruiter profile
// @route   GET /api/recruiter/profile
// @access  Private/Recruiter
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Create or Update recruiter profile
// @route   POST /api/recruiter/profile
// @access  Private/Recruiter
exports.upsertProfile = asyncHandler(async (req, res) => {
  const {
    personalInfo,
    companyInfo,
    socialLinks
  } = req.body;

  let profile = await RecruiterProfile.findOne({ user: req.user._id });

  if (profile) {
    // Update Profile
    profile.personalInfo = personalInfo || profile.personalInfo;
    profile.companyInfo = companyInfo || profile.companyInfo;
    profile.socialLinks = socialLinks || profile.socialLinks;

    await profile.save();

    // Sync name and profileImage with User model if provided
    const userUpdate = {};
    if (req.body.name) userUpdate.name = req.body.name;
    if (personalInfo?.avatar) userUpdate.profileImage = personalInfo.avatar;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } else {
    // Create
    profile = await RecruiterProfile.create({
      user: req.user._id,
      personalInfo,
      companyInfo,
      socialLinks
    });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  }
});

// @desc    Delete recruiter profile
// @route   DELETE /api/recruiter/profile
// @access  Private/Recruiter
exports.deleteProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  await profile.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully'
  });
});

// Internal helper for legacy support (will be phased out)
exports.updateRecruiterProfile = exports.upsertProfile;

// @desc    Get recruiter analytics
// @route   GET /api/recruiter/analytics
// @access  Private/Recruiter
exports.getAnalytics = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;

  const { activeJobs, totalApplicants, shortlistedCount, interviewsCount, totalHires, jobIds } = await getRecruiterStatsHelper(recruiterId);

  const applicationsByJob = await JobApplication.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } },
    { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
    { $unwind: '$job' },
    { $project: { name: '$job.title', count: 1 } }
  ]);

  // 2. Hiring Pipeline Distribution
  const pipelineDistribution = await JobApplication.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$status', value: { $sum: 1 } } },
    { $project: { name: '$_id', value: 1, _id: 0 } }
  ]);

  // 3. Monthly Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyTrend = await JobApplication.aggregate([
    {
      $match: {
        jobId: { $in: jobIds },
        appliedAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$appliedAt" },
          year: { $year: "$appliedAt" }
        },
        apps: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        name: {
          $let: {
            vars: {
              months: [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            in: { $arrayElemAt: ["$$months", "$_id.month"] }
          }
        },
        apps: 1,
        _id: 0
      }
    }
  ]);

  // 4. Job Performance (Conversion)
  const jobPerformance = await Job.find({ recruiter: recruiterId })
    .select('title views')
    .lean();

  for (let job of jobPerformance) {
    const appCount = await JobApplication.countDocuments({ jobId: job._id });
    job.applications = appCount;
    job.conversion = job.views > 0 ? ((appCount / job.views) * 100).toFixed(1) + '%' : '0%';
  }

  // 5. Top Candidate Skills
  // Note: This assumes Application model has a 'skills' field or links to Student info
  // Since we don't have complex skill tracking yet, we'll aggregate from recent job requirements 
  // as a proxy for what's being looked for, or just provide meaningful placeholders for now
  // but let's try to aggregate from Job model's skills that have been applied to
  const skillsData = await Job.aggregate([
    { $match: { recruiter: recruiterId } },
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { name: '$_id', count: 1, _id: 0 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        activeJobs: await Job.countDocuments({ recruiter: recruiterId }),
        totalApplicants,
        shortlistedCount,
        interviewsCount,
        totalHires
      },
      applicationsByJob,
      pipelineDistribution,
      monthlyTrend,
      jobPerformance,
      skillsData
    }
  });
});

// @desc    Get applications for recruiter jobs
// @route   GET /api/recruiter/applications
// @access  Private/Recruiter
exports.getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.query; // Optional filter by jobId
  const recruiterId = req.user._id;

  // console.log("DEBUG: Fetching applications for recruiter:", recruiterId);

  let query = {};
  if (jobId) {
    // Verify recruiter owns this job
    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
    if (!job) {
      res.status(403);
      throw new Error('Unauthorized access to this job');
    }
    query = { jobId };
  } else {
    // Get all jobs owned by this recruiter
    const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
    const jobIds = recruiterJobs.map(j => j._id);
    query = { jobId: { $in: jobIds } };
  }

  const applications = await JobApplication.find(query)
    .populate({
      path: 'jobId',
      select: 'title company location type salary'
    })
    .populate({
      path: 'candidateId',
      select: 'name email role skills profileImage'
    })
    .sort('-createdAt');

  // console.log(`DEBUG: Found ${applications.length} applications`);

  res.status(200).json({
    success: true,
    data: applications
  });
});

// @desc    Get single application details
// @route   GET /api/recruiter/applications/:id
// @access  Private/Recruiter
exports.getApplicationById = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const recruiterId = req.user._id;

  // console.log(`DEBUG: Fetching application detail: ${applicationId} for recruiter: ${recruiterId}`);

  const application = await JobApplication.findById(applicationId)
    .populate({
      path: 'jobId',
      select: 'title company location type salary recruiter'
    })
    .populate({
      path: 'candidateId',
      select: 'name email role skills profileImage'
    });

  if (!application) {
    console.warn(`[DEBUG] Application ${applicationId} not found in database`);
    res.status(404);
    throw new Error('Application not found');
  }

  // Verify jobId was populated and recruiter exists
  if (!application.jobId) {
    console.error(`[DEBUG] Job data missing for application ${applicationId}`);
    res.status(404);
    throw new Error('Associated job data is missing. It may have been deleted.');
  }

  const jobOwnerId = application.jobId.recruiter?.toString();
  const requesterId = recruiterId.toString();

  // console.log(`[DEBUG] Ownership Check: Requester=${requesterId} | JobOwner=${jobOwnerId}`);

  // Verify recruiter owns this job
  if (jobOwnerId !== requesterId) {
    console.warn(`[DEBUG] Unauthorized attempt by ${requesterId} to view application ${applicationId} owned by ${jobOwnerId}`);
    res.status(403);
    throw new Error('Unauthorized access to this application');
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Update application status
// @route   PUT /api/recruiter/applications/:id/status
// @access  Private/Recruiter
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;

  // console.log(`DEBUG: Updating application ${applicationId} to status: ${status}`);

  // Fetch application and verify recruiter owns the job
  const application = await JobApplication.findById(applicationId).populate('jobId');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.jobId.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized update');
  }

  // Normalize status (Handle potential lowercase from older data or frontend dnd)
  // Example: 'screening' -> 'Screening'
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  application.status = normalizedStatus;
  await application.save();

  res.status(200).json({
    success: true,
    data: application,
    message: `Application status updated to ${normalizedStatus}`
  });
});

// @desc    Get hiring pipeline grouped by status
// @route   GET /api/recruiter/pipeline/:jobId
// @access  Private/Recruiter
exports.getHiringPipeline = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const recruiterId = req.user._id;

  // console.log(`\n[DEBUG] Pipeline Request: Job=${jobId} Recruiter=${recruiterId}`);

  // 1. Verify job ownership with strict typing
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    console.error(`[DEBUG] Invalid Job ID string: ${jobId}`);
    res.status(400);
    throw new Error('Invalid Job ID');
  }

  const jobOid = new mongoose.Types.ObjectId(jobId);
  const recruiterOid = new mongoose.Types.ObjectId(recruiterId);

  const job = await Job.findOne({ _id: jobOid, recruiter: recruiterOid });
  if (!job) {
    console.warn(`[DEBUG] Job Ownership check failed for Recruiter: ${recruiterId} on Job: ${jobId}`);
    res.status(403);
    throw new Error('Unauthorized access to this job pipeline');
  }

  // 2. Fetch all applications
  const applications = await JobApplication.find({ jobId: jobOid })
    .populate({ path: 'candidateId', select: 'name email profileImage' })
    .sort('-createdAt');

  // console.log(`[DEBUG] Total applications found in DB: ${applications.length}`);

  // 3. Define stages (Keys must match STAGE_CONFIG in frontend)
  const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

  // 4. Initialize pipeline object
  const pipeline = {};
  stages.forEach(stage => pipeline[stage] = []);

  // 5. Group applications by status
  applications.forEach(app => {
    const candidateInfo = app.candidateId || {};

    // Normalize status (Handle potential lowercase from older data)
    let rawStatus = app.status || 'Applied';
    // Case-insensitive normalization: 'applied' -> 'Applied'
    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const candidateObj = {
      id: app._id,
      name: app.name || candidateInfo.name || 'Candidate',
      role: app.currentRole || 'Applicant',
      applied: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
      rating: 4,
      avatar: candidateInfo.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name || 'C')}&background=random`
    };

    if (pipeline[status]) {
      pipeline[status].push(candidateObj);
    } else {
      console.warn(`[DEBUG] Unknown status: "${status}" for application ${app._id}. Mapping to "Applied".`);
      pipeline['Applied'].push(candidateObj);
    }
  });

  console.log('[DEBUG] Pipeline Grouping Stats:',
    Object.keys(pipeline).map(k => `${k}: ${pipeline[k].length}`).join(', ')
  );

  res.status(200).json({
    success: true,
    data: pipeline
  });
});
