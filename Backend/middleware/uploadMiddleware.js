const multer = require('multer');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images (Photo)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only images are allowed.'), false);
  }
};

// File filter for documents (Resume)
const docFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF, DOC, or DOCX are allowed.'), false);
  }
};

// Multer instances for different purposes
const uploadPhoto = multer({ 
    storage, 
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: imageFilter 
});

const uploadResumeFile = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: docFilter 
});

module.exports = {
  uploadPhoto,
  uploadResumeFile
};
