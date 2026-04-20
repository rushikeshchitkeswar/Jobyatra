const asyncHandler = require('express-async-handler');
const { uploadFromBuffer } = require('../config/cloudinary');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  try {
    const folder = req.body.folder || 'avatars';
    const result = await uploadFromBuffer(req.file.buffer, {
      folder: `jobyatra/${folder}`,
      resource_type: 'image',
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Image upload failed: ${error.message}`);
  }
});

// @desc    Upload resume (PDF/DOC) to Cloudinary
// @route   POST /api/upload/resume
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a resume file');
  }

  try {
    const result = await uploadFromBuffer(req.file.buffer, {
      folder: 'jobyatra/resumes',
      resource_type: 'auto', // Auto handles PDF/DOC as raw/image depending on Cloudinary config
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Resume upload failed: ${error.message}`);
  }
});

module.exports = { uploadImage, uploadResume };
