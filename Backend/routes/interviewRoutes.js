const express = require('express');
const router = express.Router();
const { 
  scheduleInterview, 
  getMyInterviews,
  updateInterview,
  deleteInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('recruiter', 'admin'));

router.post('/schedule', scheduleInterview);
router.get('/me', getMyInterviews);
router.patch('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
