const rateLimit = require('express-rate-limit');

// Simple global limiter (already in server.js, but we can refine it here)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 login/register requests per hour
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in an hour.'
  }
});

// Limiter for file uploads (prevents spamming storage)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached. Please try again later.'
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter
};
