const Session = require('../models/Session');
const Attendee = require('../models/Attendee');
const { cacheSet, cacheGet, cacheDelete } = require('../config/redis');

// @desc Create session
// @route POST /api/sessions
// @access Private
exports.createSession = async (req, res, next) => {
  try {
    const { title, description, startTime, maxAttendees, settings } = req.body;

    const session = await Session.create({
      title,
      description,
      startTime,
      maxAttendees,
      settings: { ...settings },
      organizerId: req.user._id,
    });

    // Cache session
    await cacheSet(`session:${session._id}`, session.toObject(), 7200);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session,
    });
  } catch (error) {
    console.error('[v0] Create Session Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message,
    });
  }
};

// @desc Get all sessions
// @route GET /api/sessions
// @access Private
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ organizerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('organizerId', 'name email');

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('[v0] Get Sessions Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message,
    });
  }
};

// @desc Get single session
// @route GET /api/sessions/:id
// @access Private
exports.getSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    // Try cache first
    let session = await cacheGet(`session:${sessionId}`);

    if (!session) {
      session = await Session.findById(sessionId)
        .populate('organizerId', 'name email')
        .populate('attendees.userId', 'name email avatar')
        .populate('polls');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
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
    console.error('[v0] Get Session Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message,
    });
  }
};

// @desc Start session
// @route PUT /api/sessions/:id/start
// @access Private
exports.startSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this session',
      });
    }

    session.status = 'live';
    session.actualStartTime = new Date();
    await session.save();

    // Update cache
    await cacheDelete(`session:${session._id}`);

    res.status(200).json({
      success: true,
      message: 'Session started successfully',
      session,
    });
  } catch (error) {
    console.error('[v0] Start Session Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message,
    });
  }
};

// @desc End session
// @route PUT /api/sessions/:id/end
// @access Private
exports.endSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this session',
      });
    }

    session.status = 'completed';
    session.actualEndTime = new Date();
    await session.save();

    // Update cache
    await cacheDelete(`session:${session._id}`);

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      session,
    });
  } catch (error) {
    console.error('[v0] End Session Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message,
    });
  }
};

// @desc Add attendee to session
// @route POST /api/sessions/:id/attendees
// @access Private
exports.addAttendee = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Create attendee record
    const attendee = await Attendee.create({
      sessionId: session._id,
      userId: req.user._id,
      name: name || req.user.name,
      email: email || req.user.email,
      role: role || 'attendee',
      joinTime: new Date(),
      isActive: true,
      status: 'joined',
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
      message: 'Attendee added successfully',
      attendee,
    });
  } catch (error) {
    console.error('[v0] Add Attendee Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add attendee',
      error: error.message,
    });
  }
};

// @desc Get session analytics
// @route GET /api/sessions/:id/analytics
// @access Private
exports.getSessionAnalytics = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
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
    console.error('[v0] Get Analytics Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
