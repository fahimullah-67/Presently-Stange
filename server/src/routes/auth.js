const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  sendOTP,
  verifyOTP,
  getZoomSignature,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Gmail OTP authentication
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Private routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/zoom-signature', protect, getZoomSignature);

module.exports = router;
