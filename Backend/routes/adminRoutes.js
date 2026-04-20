const express = require('express');
const {
  getStats,
  getAnalytics,
  getUsers,
  updateUserStatus,
  verifyRecruiter,
  updateRecruiterStatus,
  getReports,
  resolveReport,
  getApplications,
  getApplicationStats,
  getCompanies,
  deleteCompanyProfile,
  getActivityLogs,
  sendNotification,
  getSettings,
  updateSettings,
  updateJobStatus,
  deleteJob,
  updateUserRole
} = require('../controllers/adminController');

const router = express.Router();

const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/applications', getApplications);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.patch('/recruiters/:id/verify', verifyRecruiter);
router.patch('/recruiters/:id/status', updateRecruiterStatus);
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);
router.get('/applications/stats', getApplicationStats);
router.get('/companies', getCompanies);
router.delete('/companies/:id', deleteCompanyProfile);
router.get('/logs', getActivityLogs);
router.post('/notifications/broadcast', sendNotification);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.patch('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

module.exports = router;
