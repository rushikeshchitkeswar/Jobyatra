const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  register,
  login,
  googleAuth,
  getMe,
  logout,
  forgotPassword,
  validateResetToken,
  resetPassword,
  updateDetails,
  updatePassword,
  updatePreferences
} = require('../controllers/authController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }
  next();
};

router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('role', 'Invalid role').optional().isIn(['user', 'recruiter', 'admin']),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  validate,
  login
);

router.post(
  '/google',
  [body('tokenId', 'Google Token ID is required').not().isEmpty()],
  validate,
  googleAuth
);

router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  validate,
  forgotPassword
);

router.get('/validate-reset-token/:resetToken', validateResetToken);

router.post(
  '/reset-password/:resetToken',
  [
    body('newPassword', 'Please enter a new password with 8 or more characters').isLength({ min: 8 }),
  ],
  validate,
  resetPassword
);

router.get('/me', optionalProtect, getMe);
router.get('/logout', protect, logout);
router.patch('/update-details', protect, updateDetails);
router.patch('/update-password', protect, updatePassword);
router.patch('/preferences', protect, updatePreferences);

module.exports = router;
