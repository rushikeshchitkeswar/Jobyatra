const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Options for cookies
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    secure: true,        // 🔥 always true for Render (HTTPS)
    sameSite: "None",
  };

  res
    .status(statusCode)
    .cookie('token', accessToken, cookieOptions) // Primary access token
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || ''
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user — recruiterStatus defaults to 'Pending' for recruiter role via model default
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // For recruiters, do NOT auto-login — send 201 with a pending message instead
    if (role === 'recruiter') {
      return res.status(201).json({
        success: true,
        recruiterPending: true,
        message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // ── Recruiter Status Gate ─────────────────────────────────────────────────
    // Only enforce status check for recruiter accounts.
    // Admins and regular users bypass this check.
    if (user.role === 'recruiter') {
      const status = user.recruiterStatus || 'Pending';
      const statusMessages = {
        Pending: 'Your recruiter application is under review. Please wait for admin approval before logging in.',
        Rejected: 'Your recruiter application has been rejected by the admin. Please contact support for more information.',
        Suspended: 'Your recruiter account has been suspended. Please contact the admin for assistance.',
      };

      if (status !== 'Approved') {
        return next(new ErrorResponse(statusMessages[status] || 'Your account is not authorized to log in.', 403));
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return next(new ErrorResponse('Token is missing', 400));
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email, sub: googleId } = ticket.getPayload();

    if (email_verified) {
      // Find if user already exists
      let user = await User.findOne({ email });

      if (user) {
        // If user exists, just log them in
        sendTokenResponse(user, 200, res);
      } else {
        // If user doesn't exist, create new user
        // Generate a random password since one is required by our generic logic (pre-save handles it)
        const password = email + process.env.JWT_ACCESS_SECRET; // Just a dummy string

        user = await User.create({
          name,
          email,
          password,
          googleId,
          role: 'user', // Default role for google signups
        });

        sendTokenResponse(user, 201, res);
      }
    } else {
      return next(new ErrorResponse('Email not verified by Google', 400));
    }
  } catch (err) {
    console.error('Google Auth Error:', err);
    return next(new ErrorResponse('Google Authentication failed', 401));
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // If optionalProtect didn't find a user, return success: false (effectively No Session)
    if (!req.user) {
      return res.status(200).json({
        success: false,
        data: null,
      });
    }

    // req.user was set by middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and Expiration in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your JobYatra account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #64748b;">${resetUrl}</p>
        <p><strong>Note:</strong> This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} JobYatra. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
        html
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      console.error('[Forgot Password Error]', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse(`Email could not be sent: ${err.message}`, 500));
    }

  } catch (err) {
    next(err);
  }
};

// @desc    Validate reset token
// @route   GET /api/auth/validate-reset-token/:resetToken
// @access  Public
exports.validateResetToken = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    // Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Clear legacy OTP fields as well
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update user details
// @route   PATCH /api/auth/update-details
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Check if email is already taken
    if (email && email !== req.user.email) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return next(new ErrorResponse('Email already registered with another account', 400));
      }
    }

    const fieldsToUpdate = {
      name: name || req.user.name,
      email: email || req.user.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PATCH /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user preferences
// @route   PATCH /api/auth/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (err) {
    next(err);
  }
};
