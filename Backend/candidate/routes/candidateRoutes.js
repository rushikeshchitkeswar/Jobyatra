const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addEducation,
  addExperience,
  updateSkills,
  getDashboardStats,
  getAppliedJobs,
  toggleSaveJob,
  getSavedJobs,
  getRecommendedJobs,
  getNotifications,
  getJobAlerts,
  createJobAlert,
  deleteJobAlert,
  getCandidateInterviews,
  getAnalytics,
  getInsights,
  uploadResume,
  deleteResume,
  getResumes,
  addProject,
  updateEducation,
  deleteEducation,
  updateExperience,
  deleteExperience,
  updateProject,
  deleteProject,
  uploadCandidatePhoto,
  addLanguage,
  deleteLanguage,
  addCertification,
  deleteCertification
} = require('../controllers/candidateController');

const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  updateProfileValidation,
  educationValidation,
  experienceValidation,
  projectValidation
} = require('../validations/candidateValidation');
const { validationResult } = require('express-validator');
const { uploadPhoto } = require('../../middleware/uploadMiddleware');

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Construct a helpful error message for the frontend toast
    const message = errors.array()
      .map(err => `${err.path}: ${err.msg}`)
      .join(', ');
    
    return res.status(400).json({ 
      success: false, 
      message: message,
      errors: errors.array() 
    });
  }
  next();
};

// All routes protected — candidate + admin access
router.use(protect);
router.use(authorize('user', 'admin'));

// Profile
router.get('/profile',  getProfile);
router.put('/profile',  updateProfileValidation, validate, updateProfile);
router.post('/profile/photo', uploadPhoto.single('photo'), uploadCandidatePhoto);

// Resume management
router.get('/profile/resumes',       getResumes);
router.post('/profile/resume',       uploadResume);
router.delete('/profile/resume/:id', deleteResume);

// Languages
router.post('/languages',       addLanguage);
router.delete('/languages/:id', deleteLanguage);

// Certifications
router.post('/certifications',       addCertification);
router.delete('/certifications/:id', deleteCertification);

// Education
router.post('/education',      educationValidation, validate, addEducation);
router.put('/education/:id',   educationValidation, validate, updateEducation);
router.delete('/education/:id', deleteEducation);

// Experience
router.post('/experience',     experienceValidation, validate, addExperience);
router.put('/experience/:id',  experienceValidation, validate, updateExperience);
router.delete('/experience/:id', deleteExperience);

// Projects
router.post('/projects',       projectValidation, validate, addProject);
router.put('/projects/:id',    projectValidation, validate, updateProject);
router.delete('/projects/:id',  deleteProject);

router.put('/skills',          updateProfileValidation, validate, updateSkills);

// Dashboard data
router.get('/stats',            getDashboardStats);
router.get('/applications',     getAppliedJobs);
router.get('/recommended-jobs', getRecommendedJobs);
router.get('/notifications',    getNotifications);
router.get('/interviews',       getCandidateInterviews);
router.get('/analytics',        getAnalytics);
router.get('/insights',         getInsights);

// Job alerts
router.get('/alerts',        getJobAlerts);
router.post('/alerts',       createJobAlert);
router.delete('/alerts/:id', deleteJobAlert);

// Saved jobs
router.get('/saved-jobs',           getSavedJobs);
router.post('/saved-jobs/:jobId',   toggleSaveJob);

module.exports = router;
