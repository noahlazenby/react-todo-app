const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerification);

// Protected routes
router.get('/me', authMiddleware.protect, authController.getCurrentUser);

module.exports = router; 