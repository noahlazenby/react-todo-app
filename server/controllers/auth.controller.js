const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Create and send JWT token
 * @param {Object} user - User object
 * @param {Object} session - Supabase session object
 * @param {Object} res - Express response object
 */
const createSendToken = (user, session, res) => {
  // Create JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );

  // Create refresh token
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    }
  );

  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };

  // Set refresh token cookie options
  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  // Send cookies
  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  // Send response
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user.id,
        email: user.email
      }
    }
  });
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sign up a new user
 */
exports.signup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return next(new AppError(`Email address "${email}" is not valid`, 400));
  }

  // Validate password strength
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  // Create user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return next(new AppError(error.message, 400));
  }

  if (data.user && !data.user.identities?.length) {
    return next(new AppError('Email already registered', 400));
  }

  // Check if email confirmation is required
  const emailConfirmationRequired = data.user && !data.user.email_confirmed_at;

  // Send response with verification status
  res.status(200).json({
    status: 'success',
    token: emailConfirmationRequired ? null : jwt.sign(
      { id: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    ),
    data: {
      user: {
        id: data.user.id,
        email: data.user.email
      },
      emailVerificationRequired: emailConfirmationRequired
    }
  });
});

/**
 * Login a user
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if email is verified
  if (data.user && !data.user.email_confirmed_at) {
    return res.status(401).json({
      status: 'fail',
      message: 'Email not verified. Please check your inbox and verify your email before logging in.',
      data: {
        emailVerificationRequired: true,
        email: data.user.email
      }
    });
  }

  // Send token
  createSendToken(data.user, data.session, res);
});

/**
 * Log out a user
 */
exports.logout = catchAsync(async (req, res, next) => {
  // Clear cookies
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.cookie('refreshToken', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000)
  });

  // Sign out from Supabase
  await supabase.auth.signOut();

  res.status(200).json({ status: 'success' });
});

/**
 * Get current user
 */
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  // Get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  try {
    // Verify token with our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if decoded token has necessary user info
    if (!decoded || !decoded.id || !decoded.email) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    
    // Send response with user info from the decoded token
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: decoded.id,
          email: decoded.email
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return next(new AppError('Invalid token', 401));
  }
});

/**
 * Resend verification email
 */
exports.resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return next(new AppError(`Email address "${email}" is not valid`, 400));
  }

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !user) {
      return next(new AppError('User not found', 404));
    }

    // Send verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      return next(new AppError(`Failed to resend verification email: ${error.message}`, 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Verification email has been sent'
    });
  } catch (err) {
    return next(new AppError(`Error resending verification email: ${err.message}`, 500));
  }
});

/**
 * Test login endpoint that always succeeds (for debugging)
 */
exports.loginTest = catchAsync(async (req, res) => {
  // Create a mock user
  const mockUser = {
    id: 'test-user-123',
    email: req.body.email || 'test@example.com'
  };

  // Create JWT token
  const token = jwt.sign(
    { id: mockUser.id, email: mockUser.email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1d' }
  );

  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };

  // Send cookie
  res.cookie('jwt', token, cookieOptions);

  // Send response
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: mockUser
    }
  });
}); 