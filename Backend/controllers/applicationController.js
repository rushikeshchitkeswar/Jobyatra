const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private/Recruiter
exports.getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const applications = await Application.find({ jobId })
    .populate('studentId', 'name email avatar education skills experience')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Update application status
// @route   PUT /api/applications/status/:id
// @access  Private/Recruiter
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Ensure recruiter owns the job
  if (application.recruiterId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this application');
  }

  application.status = status;
  await application.save();

  // Create notification for student
  await Notification.create({
    recipientId: application.studentId,
    senderId: req.user._id,
    message: `Your application status for ${application.jobId} has been updated to ${status}`,
    type: 'Application',
    link: `/my-applications`
  });

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Get hiring pipeline for a job
// @route   GET /api/applications/pipeline/:jobId
// @access  Private/Recruiter
exports.getHiringPipeline = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const applications = await Application.find({ jobId })
    .populate('studentId', 'name email avatar')
    .select('studentId status');

  const pipeline = {
    Applied: [],
    Screening: [],
    Shortlisted: [],
    Interview: [],
    Offer: [],
    Hired: [],
    Rejected: []
  };

  applications.forEach(app => {
    if (pipeline[app.status]) {
      pipeline[app.status].push({
        id: app._id,
        name: app.studentId.name,
        avatar: app.studentId.avatar,
        status: app.status
      });
    }
  });

  res.status(200).json({
    success: true,
    data: pipeline
  });
});
