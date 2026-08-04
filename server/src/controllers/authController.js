const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { cacheSet, cacheGet, cacheDelete } = require('../config/redis');
const emailService = require('../services/emailService');
const zoomService = require('../services/zoomService');

// Generate JWT Token
const generateToken = (id, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    // Cache user data
    await cacheSet(`user:${user._id}`, user.toJSON(), 3600);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Register Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (including password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Cache user data
    await cacheSet(`user:${user._id}`, user.toJSON(), 3600);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// @desc Logout user
// @route POST /api/auth/logout
// @access Private
exports.logout = async (req, res, next) => {
  try {
    // Delete user from cache
    await cacheDelete(`user:${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[v0] Logout Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
// @access Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Get Current User Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(preferences && { preferences: { ...req.user.preferences, ...preferences } }),
      },
      { new: true, runValidators: true }
    );

    // Update cache
    await cacheSet(`user:${user._id}`, user.toJSON(), 3600);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Update Profile Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// @desc Send OTP to email for Gmail login
// @route POST /api/auth/send-otp
// @access Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Send OTP email
    const result = await emailService.sendOTPEmail(email, name);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    console.error('[v0] Send OTP Error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// @desc Verify OTP and login/register user
// @route POST /api/auth/verify-otp
// @access Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, name } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Verify OTP
    const verification = await emailService.verifyOTP(email, otp);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist (Gmail signup)
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        authMethod: 'gmail',
        isEmailVerified: true,
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(email, user.name);
    } else {
      // Update user as verified
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Cache user data
    await cacheSet(`user:${user._id}`, user.toJSON(), 3600);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Verify OTP Error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed',
    });
  }
};

// @desc Get Zoom signature for SDK
// @route POST /api/auth/zoom-signature
// @access Private
exports.getZoomSignature = async (req, res, next) => {
  try {
    const { meetingId, role } = req.body;

    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required',
      });
    }

    // Generate signature
    const signature = zoomService.generateSignature(meetingId, role || 0);

    res.status(200).json({
      success: true,
      signature,
      meetingId,
    });
  } catch (error) {
    console.error('[v0] Get Zoom Signature Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Zoom signature',
      error: error.message,
    });
  }
};
