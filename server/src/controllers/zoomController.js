import Session from "../models/Session.js";
import { zoomService } from "../services/zoomService.js";
import { cacheSet, cacheGet } from "../config/redis.js";

// @desc Create Zoom meeting
// @route POST /api/zoom/create-meeting
// @access Private
export const createMeeting = async (req, res, next) => {
  try {
    const { topic, startTime, duration, sessionId } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    // Create meeting via Zoom API
    const meeting = await zoomService.createMeeting(req.user._id, {
      topic,
      startTime: startTime || new Date(),
      duration: duration || 60,
    });

    // If sessionId provided, update session with Zoom meeting info
    if (sessionId) {
      await Session.findByIdAndUpdate(
        sessionId,
        {
          zoomMeetingId: meeting.meetingId,
          zoomJoinUrl: meeting.joinUrl,
          zoomStartUrl: meeting.startUrl,
        },
        { new: true },
      );
    }

    res.status(201).json({
      success: true,
      message: "Zoom meeting created successfully",
      meeting,
    });
  } catch (error) {
    console.error("[v0] Create Zoom Meeting Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create Zoom meeting",
      error: error.message,
    });
  }
};

// @desc Get meeting info
// @route GET /api/zoom/meeting/:meetingId
// @access Private
export const getMeetingInfo = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const meeting = await zoomService.getMeetingInfo(meetingId);

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("[v0] Get Meeting Info Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get meeting info",
      error: error.message,
    });
  }
};

// @desc Get meeting participants
// @route GET /api/zoom/meeting/:meetingId/participants
// @access Private
export const getMeetingParticipants = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const participants = await zoomService.getMeetingParticipants(meetingId);

    res.status(200).json({
      success: true,
      participants,
      count: participants.length,
    });
  } catch (error) {
    console.error("[v0] Get Participants Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get participants",
      error: error.message,
    });
  }
};

// @desc End Zoom meeting
// @route POST /api/zoom/meeting/:meetingId/end
// @access Private
export const endMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    await zoomService.endMeeting(meetingId);

    res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
    });
  } catch (error) {
    console.error("[v0] End Meeting Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to end meeting",
      error: error.message,
    });
  }
};

// @desc Get meeting recordings
// @route GET /api/zoom/meeting/:meetingId/recordings
// @access Private
export const getRecordings = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const recordings = await zoomService.getMeetingRecordings(meetingId);

    res.status(200).json({
      success: true,
      recordings,
      count: recordings.length,
    });
  } catch (error) {
    console.error("[v0] Get Recordings Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get recordings",
      error: error.message,
    });
  }
};

// @desc Get SDK token for client-side
// @route POST /api/zoom/get-token
// @access Private
export const getSDKToken = async (req, res, next) => {
  try {
    const { meetingId, role } = req.body;

    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: "Meeting ID is required",
      });
    }

    // Generate signature for Zoom SDK
    const signature = zoomService.generateSignature(meetingId, role || 0);

    res.status(200).json({
      success: true,
      signature,
      clientId: process.env.ZOOM_CLIENT_ID,
      meetingId,
    });
  } catch (error) {
    console.error("[v0] Get SDK Token Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate SDK token",
      error: error.message,
    });
  }
};

// @desc List user's meetings
// @route GET /api/zoom/my-meetings
// @access Private
export const getUserMeetings = async (req, res, next) => {
  try {
    const meetings = await zoomService.getUserMeetings();

    res.status(200).json({
      success: true,
      meetings,
      count: meetings.length,
    });
  } catch (error) {
    console.error("[v0] Get User Meetings Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get meetings",
      error: error.message,
    });
  }
};

// @desc Delete meeting
// @route DELETE /api/zoom/meeting/:meetingId
// @access Private
export const deleteMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    await zoomService.deleteMeeting(meetingId);

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("[v0] Delete Meeting Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete meeting",
      error: error.message,
    });
  }
};
