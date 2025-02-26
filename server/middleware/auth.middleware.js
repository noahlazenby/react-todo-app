const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const supabase = require('../config/supabase');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from authorization header or cookies
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
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    // 2) Verify token with our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3) Check if user exists in our database
    if (!decoded || !decoded.id || !decoded.email) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    
    // 4) Grant access to protected route
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return next(new AppError('Invalid authentication token. Please log in again.', 401));
  }
});

/**
 * Middleware to refresh the access token
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return next();
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Create new access token
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error || !data) {
      return next();
    }

    // Set new access token as cookie
    res.cookie('jwt', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    next();
  } catch (err) {
    next();
  }
}); 