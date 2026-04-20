const express = require('express');
const {
  getJobs,
  getJobById,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const {
  submitApplication,
  getApplicationsForJob
} = require('../controllers/jobApplicationController');
const { toggleSaveJob } = require('../candidate/controllers/candidateController');
const { uploadResumeFile } = require('../middleware/uploadMiddleware');

const router = express.Router();

const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter', 'admin'), createJob);

router.post('/create', protect, authorize('recruiter', 'admin'), createJob);

router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('recruiter', 'admin'), updateJob)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

// Public: submit a job application (multipart/form-data with resume file) 
// Uses optionalProtect to link to user ID if they are logged in 
router.post('/:id/apply', optionalProtect, uploadResumeFile.single('resume'), submitApplication); 
 
// Private: candidate saves/unsaves a job 
router.post('/save', protect, toggleSaveJob);
router.post('/:id/save', protect, toggleSaveJob); 
 
// Private: recruiter views applications for a specific job 
router.get('/:id/applications', protect, authorize('recruiter', 'admin'), getApplicationsForJob);

module.exports = router;
