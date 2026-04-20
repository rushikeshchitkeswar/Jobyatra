const ActivityLog = require('../../models/ActivityLog');

/**
 * Log a user activity
 * @param {string} userId - ID of the user
 * @param {string} action - Action performed (e.g. 'profile_update')
 * @param {string} category - Category (e.g. 'Profile')
 * @param {string} details - Human readable description
 * @param {Object} metadata - Additional machine readable data
 */
const logActivity = async (userId, action, category, details = '', metadata = {}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      category,
      details,
      metadata
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // We don't throw here as activity logging shouldn't break the main flow
  }
};

/**
 * Get recent activities for a user
 * @param {string} userId - ID of the user
 * @param {number} limit - Number of activities to fetch
 */
const getRecentActivities = async (userId, limit = 10) => {
  return await ActivityLog.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

module.exports = {
  logActivity,
  getRecentActivities
};
