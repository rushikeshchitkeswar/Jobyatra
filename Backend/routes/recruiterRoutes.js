const express = require('express');
const router = express.Router();
// console.log('--- [DEBUG] RECRUITER ROUTES REGISTERING ---');
const {
  getDashboardStats,
  getProfile,
  upsertProfile,
  deleteProfile,
  updateRecruiterProfile,
  getAnalytics,
  getJobApplications,
  getApplicationById,
  getHiringPipeline,
  updateApplicationStatus
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('recruiter', 'admin'));

router.get('/health-check', (req, res) => res.json({ ok: true, message: 'RECRUITER_MOUNT_OK' }));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Recruiter Profile CRUD
router.get('/profile', getProfile);
router.post('/profile', upsertProfile);
router.put('/profile', upsertProfile); // Alias for update
router.delete('/profile', deleteProfile);

// Application Management
router.get('/applications', getJobApplications);
router.get('/applications/:id', getApplicationById);
router.get('/pipeline/:jobId', getHiringPipeline);
router.put('/applications/:id/status', updateApplicationStatus);
router.patch('/applications/:id/status', updateApplicationStatus);

module.exports = router;
