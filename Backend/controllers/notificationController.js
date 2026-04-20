const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipientId: req.user.id })
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({ 
    recipientId: req.user.id,
    read: false 
  });

  res.status(200).json({
    success: true,
    data: count
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is notification owner
  if (notification.recipientId.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse(`Not authorized to update this notification`, 401));
  }

  notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark notification as unread
// @route   PATCH /api/notifications/:id/unread
// @access  Private
exports.markAsUnread = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is notification owner
  if (notification.recipientId.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse(`Not authorized to update this notification`, 401));
  }

  notification = await Notification.findByIdAndUpdate(req.params.id, { read: false }, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearAll = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipientId: req.user.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipientId: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});
