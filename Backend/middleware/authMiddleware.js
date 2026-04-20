const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in cookies or headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    // console.log("Token from cookies:", token);
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log("Token from headers:", token);
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from the token ID
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User no longer exists', 401));
    }

    // Check if user is blocked (generic block for all roles)
    if (req.user.isBlocked) {
      return next(new ErrorResponse('Your account has been suspended. Please contact support.', 403));
    }

    // ── Recruiter Session-Level Status Check ──
    // Invalidate existing tokens for recruiters whose status changed post-login.
    // This ensures that if an admin suspends/rejects a recruiter, their existing
    // session is terminated immediately on their next API request.
    if (req.user.role === 'recruiter') {
      const status = req.user.recruiterStatus || 'Pending';
      const statusMessages = {
        Pending: 'Your recruiter account is pending admin approval.',
        Rejected: 'Your recruiter account has been rejected. Please contact support.',
        Suspended: 'Your recruiter account has been suspended. Please contact admin.',
      };
      if (status !== 'Approved') {
        return next(new ErrorResponse(statusMessages[status] || 'Recruiter account not authorized.', 403));
      }
    }
    //

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Check for Admin role specifically
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new ErrorResponse('Access denied: Admin role required', 403));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Optional protect - attaches user if token exists, but doesn't block
exports.optionalProtect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    // Just move on without user
    next();
  }
};
