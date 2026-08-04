const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getSession,
  startSession,
  endSession,
  addAttendee,
  getSessionAnalytics,
} = require('../controllers/sessionController');

// Private routes - all require authentication
router.use(protect);

// Session management
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.put('/:id/start', startSession);
router.put('/:id/end', endSession);

// Attendee management
router.post('/:id/attendees', addAttendee);

// Analytics
router.get('/:id/analytics', getSessionAnalytics);

module.exports = router;
