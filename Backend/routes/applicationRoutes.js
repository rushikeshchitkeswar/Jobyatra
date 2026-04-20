const express = require('express');
const router = express.Router();
const { 
  getJobApplications, 
  updateApplicationStatus,
  getHiringPipeline
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('recruiter', 'admin'));

router.get('/job/:jobId', getJobApplications);
router.get('/pipeline/:jobId', getHiringPipeline);
router.put('/status/:id', updateApplicationStatus);

module.exports = router;
