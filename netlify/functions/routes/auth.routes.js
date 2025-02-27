const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerification);

// Test login endpoint for development/debugging
router.post('/login-test', (req, res) => {
  console.log('[DEBUG] Test login endpoint called with:', req.body.email);
  
  // Create a test token
  const token = jwt.sign(
    { id: req.body.email || 'test@example.com', email: req.body.email || 'test@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1d' }
  );
  
  // Send response with token
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: req.body.email || 'test@example.com',
        email: req.body.email || 'test@example.com'
      }
    }
  });
});

// Protected routes
router.get('/me', authMiddleware.protect, authController.getCurrentUser);

module.exports = router; 