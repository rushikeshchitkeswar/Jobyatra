const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Schedule an interview
// @route   POST /api/interviews/schedule
// @access  Private/Recruiter
exports.scheduleInterview = asyncHandler(async (req, res) => {
  const { jobId, applicationId, studentId, interviewDate, interviewType, meetingLink, location, notes } = req.body;

  const interview = await Interview.create({
    jobId,
    applicationId,
    studentId,
    recruiterId: req.user._id,
    interviewDate,
    interviewType,
    meetingLink,
    location,
    notes
  });

  // Update application status to Interview
  await JobApplication.findByIdAndUpdate(applicationId, { status: 'Interview' });
  
  // Create notification for student
  await Notification.create({
    recipientId: studentId,
    senderId: req.user._id,
    title: 'Interview Scheduled',
    message: `You have a new interview scheduled for ${new Date(interviewDate).toLocaleString()}`,
    type: 'Interview',
    link: `/my-interviews`
  });

  res.status(201).json({
    success: true,
    data: interview
  });
});

// @desc    Get recruiter's interviews
// @route   GET /api/interviews/me
// @access  Private/Recruiter
exports.getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ recruiterId: req.user._id })
    .populate('studentId', 'name email avatar')
    .populate('jobId', 'title')
    .sort('interviewDate');

  res.status(200).json({
    success: true,
    count: interviews.length,
    data: interviews
  });
});

// @desc    Update interview status or details
// @route   PATCH /api/interviews/:id
// @access  Private/Recruiter
exports.updateInterview = asyncHandler(async (req, res) => {
  let interview = await Interview.findById(req.params.id);

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  // Check ownership
  if (interview.recruiterId.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to update this interview');
  }

  interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // If status changed to Completed, we might want to notify or change app status
  if (req.body.interviewStatus === 'Completed') {
    // Optional: Auto move to next stage or just leave as is
  }

  res.status(200).json({
    success: true,
    data: interview
  });
});

// @desc    Delete/Cancel an interview
// @route   DELETE /api/interviews/:id
// @access  Private/Recruiter
exports.deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  // Check ownership
  if (interview.recruiterId.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to delete this interview');
  }

  await interview.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
