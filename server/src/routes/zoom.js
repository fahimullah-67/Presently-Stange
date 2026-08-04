const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const zoomController = require('../controllers/zoomController');

// Create Zoom meeting
router.post('/create-meeting', protect, zoomController.createMeeting);

// Get SDK token
router.post('/get-token', protect, zoomController.getSDKToken);

// Get user's meetings
router.get('/my-meetings', protect, zoomController.getUserMeetings);

// Get meeting info
router.get('/meeting/:meetingId', protect, zoomController.getMeetingInfo);

// Get participants
router.get('/meeting/:meetingId/participants', protect, zoomController.getMeetingParticipants);

// Get recordings
router.get('/meeting/:meetingId/recordings', protect, zoomController.getRecordings);

// End meeting
router.post('/meeting/:meetingId/end', protect, zoomController.endMeeting);

// Delete meeting
router.delete('/meeting/:meetingId', protect, zoomController.deleteMeeting);

module.exports = router;
