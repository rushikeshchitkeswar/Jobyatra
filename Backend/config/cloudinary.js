const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { Readable } = require('stream');

/**
 * Helper to upload file buffer to Cloudinary using a stream
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Cloudinary upload options
 */
const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    console.log('[CLOUDINARY] Starting stream upload...');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('[CLOUDINARY] Stream error:', error);
          reject(error);
        } else {
          console.log('[CLOUDINARY] Upload successful:', result.public_id);
          resolve(result);
        }
      }
    );

    // Create a readable stream from the buffer and pipe it to Cloudinary
    Readable.from(buffer).pipe(uploadStream);
  });
};

module.exports = { cloudinary, uploadFromBuffer };
