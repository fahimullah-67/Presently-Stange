import Session from "../models/Session.js";
import Attendee from "../models/Attendee.js";
import { cacheSet, cacheGet, cacheDelete } from "../config/redis.js";


export const createSession = async (req, res, next) => {
  try {
    const { title, description, startTime, maxAttendees, settings } = req.body;

    console.log("title", title);
    

    const session = await Session.create({
      title,
      description,
      startTime,
      maxAttendees,
      settings: { ...settings },
      organizerId: req.user._id,
    });
    console.log("session", session);
    

    // Cache session
    await cacheSet(`session:${session._id}`, session.toObject(), 7200);

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session,
    });
  } catch (error) {
    console.error("Create Session Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create session",
      error: error.message,
    });
  }
};



export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ organizerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("organizerId", "name email");

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Get Sessions Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};



export const getSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    // Try cache first
    let session = await cacheGet(`session:${sessionId}`);

    if (!session) {
      session = await Session.findById(sessionId)
        .populate("organizerId", "name email")
        .populate("attendees.userId", "name email avatar")
        .populate("polls");

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      // Cache it
      await cacheSet(`session:${sessionId}`, session.toObject(), 3600);
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get Session Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session",
      error: error.message,
    });
  }
};


export const startSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to start this session",
      });
    }

    session.status = "live";
    session.actualStartTime = new Date();
    await session.save();

    // Update cache
    await cacheDelete(`session:${session._id}`);

    res.status(200).json({
      success: true,
      message: "Session started successfully",
      session,
    });
  } catch (error) {
    console.error("Start Session Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to start session",
      error: error.message,
    });
  }
};



export const endSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to end this session",
      });
    }

    session.status = "completed";
    session.actualEndTime = new Date();
    await session.save();

    // Update cache
    await cacheDelete(`session:${session._id}`);

    res.status(200).json({
      success: true,
      message: "Session ended successfully",
      session,
    });
  } catch (error) {
    console.error("[v0] End Session Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to end session",
      error: error.message,
    });
  }
};



export const addAttendee = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Create attendee record
    const attendee = await Attendee.create({
      sessionId: session._id,
      userId: req.user._id,
      name: name || req.user.name,
      email: email || req.user.email,
      role: role || "attendee",
      joinTime: new Date(),
      isActive: true,
      status: "joined",
    });

    // Add to session
    await session.addAttendee({
      userId: req.user._id,
      name: attendee.name,
      email: attendee.email,
      joinedAt: attendee.joinTime,
      role: attendee.role,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Attendee added successfully",
      attendee,
    });
  } catch (error) {
    console.error("Add Attendee Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add attendee",
      error: error.message,
    });
  }
};


export const getSessionAnalytics = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const attendees = await Attendee.find({ sessionId: session._id });
    const activeAttendees = attendees.filter((a) => a.isActive).length;

    const analytics = {
      totalAttendees: session.analytics.totalAttendees,
      activeAttendees,
      duration: session.duration || 0,
      totalPolls: session.analytics.totalPolls,
      totalMessages: session.analytics.totalMessages,
      engagementScore: session.analytics.engagementScore || 0,
      attendeeEngagement: attendees.map((a) => ({
        name: a.name,
        score: a.engagement.engagementScore,
        polls: a.engagement.pollsAnswered,
        messages: a.engagement.messagesCount,
      })),
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get Analytics Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
