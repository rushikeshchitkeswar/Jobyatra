const express = require('express');
const router = express.Router();
const { uploadImage, uploadResume } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPhoto, uploadResumeFile } = require('../middleware/uploadMiddleware');

router.post('/image', protect, uploadPhoto.single('image'), uploadImage);
router.post('/resume', protect, uploadResumeFile.single('resume'), uploadResume);

module.exports = router;
