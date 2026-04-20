const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/JobApplication');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const RecruiterProfile = require('../models/RecruiterProfile');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalCandidates = await User.countDocuments({ role: 'user' });
  const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();

  const totalCompanies = await User.distinct('companyName', { role: 'recruiter' }).then(companies => companies.length);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      totalApplications,
      totalCompanies: totalCompanies || 0
    }
  });
});

// @desc    Get analytics data for charts
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const jobTrend = await Job.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      userGrowth,
      jobTrend
    }
  });
});

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let baseQuery = JSON.parse(queryStr);

  if (req.query.search) {
    baseQuery.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  query = User.find(baseQuery);

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments(baseQuery);

  query = query.skip(startIndex).limit(limit);

  const users = await query;

  const pagination = {};
  if (endIndex < total) pagination.next = { page: page + 1, limit };
  if (startIndex > 0) pagination.prev = { page: page - 1, limit };

  let usersData = users;
  if (req.query.role === 'recruiter') {
    usersData = await Promise.all(users.map(async (u) => {
      // Fetch jobs and unique company names from postings
      const jobs = await Job.find({ recruiter: u._id }).select('company');
      const jobCount = jobs.length;
      const postedCompanies = [...new Set(jobs.map(j => j.company))];

      // Fetch primary company name from RecruiterProfile
      const profile = await RecruiterProfile.findOne({ user: u._id }).select('companyInfo.name');
      const primaryCompany = profile?.companyInfo?.name || postedCompanies[0] || '';

      return {
        ...u.toObject(),
        jobCount,
        postedCompanies,
        companyName: primaryCompany
      };
    }));
  }

  res.status(200).json({
    success: true,
    count: usersData.length,
    total,
    pagination,
    data: usersData
  });
});

// @desc    Update user status (Block/Unblock)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isBlocked, accountStatus } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked, accountStatus },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await AuditLog.create({
    adminId: req.user.id,
    action: isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
    targetType: 'User',
    targetId: user.id,
    details: { accountStatus }
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'recruiter', 'admin'].includes(role)) {
    return next(new ErrorResponse('Invalid role provided', 400));
  }

  // Prevent self-demotion
  if (req.user.id.toString() === req.params.id.toString() && role !== 'admin') {
    return next(new ErrorResponse('Security Policy: You cannot change your own admin role', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await AuditLog.create({
    adminId: req.user.id,
    action: 'UPDATE_USER_ROLE',
    targetType: 'User',
    targetId: user.id,
    details: { newRole: role }
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Approve or Reject recruiter (legacy endpoint, kept for compat)
// @route   PATCH /api/admin/recruiters/:id/verify
// @access  Private/Admin
exports.verifyRecruiter = asyncHandler(async (req, res, next) => {
  const { verified } = req.body;

  const newStatus = verified ? 'Approved' : 'Rejected';

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      recruiterVerified: verified,
      recruiterStatus: newStatus
    },
    { new: true, runValidators: true }
  );

  if (!user || user.role !== 'recruiter') {
    return next(new ErrorResponse(`Recruiter not found with id of ${req.params.id}`, 404));
  }

  await AuditLog.create({
    adminId: req.user.id,
    action: verified ? 'VERIFY_RECRUITER' : 'REJECT_RECRUITER',
    targetType: 'User',
    targetId: user.id,
    details: { recruiterStatus: newStatus }
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Update recruiter status (Pending / Approved / Rejected / Suspended)
// @route   PATCH /api/admin/recruiters/:id/status
// @access  Private/Admin
exports.updateRecruiterStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Suspended'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
  }

  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'recruiter') {
    return next(new ErrorResponse(`Recruiter not found with id of ${req.params.id}`, 404));
  }

  // Keep recruiterVerified in sync for backward compatibility
  user.recruiterStatus = status;
  user.recruiterVerified = (status === 'Approved');
  // Also sync isBlocked for suspended accounts
  user.isBlocked = (status === 'Suspended');
  await user.save({ validateBeforeSave: false });

  const actionMap = {
    Approved:  'APPROVE_RECRUITER',
    Rejected:  'REJECT_RECRUITER',
    Suspended: 'SUSPEND_RECRUITER',
    Pending:   'RESET_RECRUITER_STATUS',
  };

  await AuditLog.create({
    adminId: req.user.id,
    action: actionMap[status],
    targetType: 'User',
    targetId: user.id,
    details: { recruiterStatus: status }
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  const reports = await Report.find().populate('reporter', 'name email').sort('-createdAt');
  res.status(200).json({ success: true, data: reports });
});

// @desc    Resolve report
// @route   PATCH /api/admin/reports/:id/resolve
// @access  Private/Admin
exports.resolveReport = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNotes,
      resolvedBy: req.user.id,
      resolvedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  if (!report) {
    return next(new ErrorResponse(`Report not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: report });
});

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private/Admin
exports.getApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find()
    .populate('jobId', 'title company')
    .populate('candidateId', 'name email')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: applications });
});

// @desc    Get detailed application stats for monitoring
// @route   GET /api/admin/applications/stats
// @access  Private/Admin
exports.getApplicationStats = asyncHandler(async (req, res, next) => {
  const stats = await Application.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await Application.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      total,
      breakdown: stats
    }
  });
});

// @desc    Update job status (Moderation)
// @route   PATCH /api/admin/jobs/:id/status
// @access  Private/Admin
exports.updateJobStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  await AuditLog.create({
    adminId: req.user.id,
    action: 'MODERATE_JOB_STATUS',
    targetType: 'Job',
    targetId: job.id,
    details: { newStatus: status, title: job.title }
  });

  res.status(200).json({ success: true, data: job });
});

// @desc    Delete job (Admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  await job.deleteOne();

  await AuditLog.create({
    adminId: req.user.id,
    action: 'DELETE_JOB_ADMIN',
    targetType: 'Job',
    targetId: req.params.id,
    details: { title: job.title, company: job.company }
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all companies (Detailed profiles from recruiters)
// @route   GET /api/admin/companies
// @access  Private/Admin
exports.getCompanies = asyncHandler(async (req, res, next) => {
  const profiles = await RecruiterProfile.find()
    .populate('user', 'name email recruiterVerified')
    .sort('-createdAt');

  // Enrich with job counts
  const companyData = await Promise.all(profiles.map(async (profile) => {
    const jobCount = await Job.countDocuments({ recruiter: profile.user?._id });
    return {
      ...profile.toObject(),
      jobCount
    };
  }));

  res.status(200).json({ success: true, count: companyData.length, data: companyData });
});

// @desc    Delete company profile
// @route   DELETE /api/admin/companies/:id
// @access  Private/Admin
exports.deleteCompanyProfile = asyncHandler(async (req, res, next) => {
  const profile = await RecruiterProfile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Company profile not found with id of ${req.params.id}`, 404));
  }

  // Optional: Also reset recruiterVerified on User if we want to force re-submission
  if (profile.user) {
    await User.findByIdAndUpdate(profile.user, { recruiterVerified: false });
  }

  await profile.deleteOne();

  await AuditLog.create({
    adminId: req.user.id,
    action: 'DELETE_COMPANY_PROFILE',
    targetType: 'RecruiterProfile',
    targetId: req.params.id
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get activity logs (Audit Logs)
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getActivityLogs = asyncHandler(async (req, res, next) => {
  const logs = await AuditLog.find()
    .populate('adminId', 'name email')
    .sort('-timestamp')
    .limit(50); // Hard limit for safety

  res.status(200).json({ success: true, data: logs });
});

// @desc    Broadcast notification (Role-based)
// @route   POST /api/admin/notifications/broadcast
// @access  Private/Admin
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { title, message, targetAudience, type } = req.body;

  if (!title || !message) {
    return next(new ErrorResponse('Please provide both title and message', 400));
  }

  let userQuery = {};
  if (targetAudience === 'candidates') {
    userQuery = { role: 'user' };
  } else if (targetAudience === 'recruiters') {
    userQuery = { role: 'recruiter' };
  }

  const recipients = await User.find(userQuery, '_id');

  if (recipients.length === 0) {
    return res.status(200).json({ success: true, message: 'No recipients found for this selection' });
  }

  // Bulk prepare individual notifications
  const notifications = recipients.map(user => ({
    recipientId: user._id,
    senderId: req.user.id,
    title,
    message,
    type: type || 'System',
    targetRole: targetAudience
  }));

  // Efficient bulk insert
  await Notification.insertMany(notifications);

  // Log action
  await AuditLog.create({
    adminId: req.user.id,
    action: 'BROADCAST_NOTIFICATION',
    targetType: 'System',
    details: { targetAudience, title, recipientCount: recipients.length }
  });

  res.status(200).json({
    success: true,
    message: `Notification broadcasted to ${recipients.length} ${targetAudience === 'all' ? 'users' : targetAudience}`
  });
});

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res, next) => {
  const settings = await Settings.getSettings();
  res.status(200).json({ success: true, data: settings });
});

// @desc    Update platform settings
// @route   PATCH /api/admin/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true
    });
  }

  // Log action
  await AuditLog.create({
    adminId: req.user.id,
    action: 'UPDATE_SETTINGS',
    targetType: 'System',
    details: req.body
  });

  res.status(200).json({ success: true, data: settings });
});
