import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.js";
import {
  createMeeting,
  deleteMeeting,
  endMeeting,
  getMeetingInfo,
  getMeetingParticipants,
  getRecordings,
  getSDKToken,
  getUserMeetings,
} from "../controllers/zoomController.js";

// Create Zoom meeting
router.post("/create-meeting", protect, createMeeting);

// Get SDK token
router.post("/get-token", protect, getSDKToken);

// Get user's meetings
router.get("/my-meetings", protect, getUserMeetings);

// Get meeting info
router.get("/meeting/:meetingId", protect, getMeetingInfo);

// Get participants
router.get("/meeting/:meetingId/participants", protect, getMeetingParticipants);

// Get recordings
router.get("/meeting/:meetingId/recordings", protect, getRecordings);

// End meeting
router.post("/meeting/:meetingId/end", protect, endMeeting);

// Delete meeting
router.delete("/meeting/:meetingId", protect, deleteMeeting);

export default router;
