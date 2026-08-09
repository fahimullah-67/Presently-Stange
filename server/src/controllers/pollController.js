import Poll from "../models/Poll.js";
import Session from "../models/Session.js";
import Attendee from "../models/Attendee.js";
import mongoose from "mongoose";

// @desc Create poll
// @route POST /api/polls
// @access Private
export const createPoll = async (req, res, next) => {
  try {
    const {
      sessionId,
      question,
      description,
      type,
      options,
      isAnonymous,
      showLiveResults,
    } = req.body;

    // Validate session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Create option objects with IDs
    const pollOptions = options.map((text) => ({
      _id: new mongoose.Types.ObjectId(),
      text,
      votes: 0,
    }));

    const poll = await Poll.create({
      sessionId,
      createdBy: req.user._id,
      question,
      description,
      type,
      options: pollOptions,
      isAnonymous,
      showLiveResults,
    });

    // Add poll to session
    session.polls.push(poll._id);
    session.analytics.totalPolls = session.polls.length;
    await session.save();

    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll,
    });
  } catch (error) {
    console.error("[v0] Create Poll Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create poll",
      error: error.message,
    });
  }
};

// @desc Get polls for session
// @route GET /api/sessions/:sessionId/polls
// @access Private
export const getSessionPolls = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const polls = await Poll.find({ sessionId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      polls,
    });
  } catch (error) {
    console.error("[v0] Get Session Polls Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch polls",
      error: error.message,
    });
  }
};

// @desc Get single poll with results
// @route GET /api/polls/:id
// @access Private
export const getPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    const results = await Poll.getPollResults(req.params.id);

    res.status(200).json({
      success: true,
      poll,
      results,
    });
  } catch (error) {
    console.error("[v0] Get Poll Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch poll",
      error: error.message,
    });
  }
};

// @desc Add response to poll
// @route POST /api/polls/:id/respond
// @access Private
export const respondToPoll = async (req, res, next) => {
  try {
    const { selectedOption, textResponse } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    // Check if already responded (if multiple votes not allowed)
    if (!poll.allowMultipleVotes) {
      const hasResponded = poll.responses.some(
        (r) => r.respondentId?.toString() === req.user._id.toString(),
      );

      if (hasResponded) {
        return res.status(400).json({
          success: false,
          message: "You have already responded to this poll",
        });
      }
    }

    // Add response
    poll.responses.push({
      respondentId: req.user._id,
      respondentName: poll.isAnonymous ? "Anonymous" : req.user.name,
      selectedOption,
      textResponse,
      timestamp: new Date(),
    });

    // Update vote count
    if (selectedOption) {
      const option = poll.options.find(
        (o) => o._id.toString() === selectedOption.toString(),
      );
      if (option) {
        option.votes += 1;
      }
    }

    await poll.save();

    // Update attendee engagement
    const attendee = await Attendee.findOne({
      sessionId: poll.sessionId,
      userId: req.user._id,
    });

    if (attendee) {
      await attendee.updateEngagement("poll");
    }

    res.status(201).json({
      success: true,
      message: "Response recorded successfully",
      poll,
    });
  } catch (error) {
    console.error("[v0] Respond to Poll Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to record response",
      error: error.message,
    });
  }
};

// @desc End poll
// @route PUT /api/polls/:id/end
// @access Private
export const endPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to end this poll",
      });
    }

    poll.isActive = false;
    poll.endTime = new Date();

    // Calculate analytics
    if (poll.type === "rating") {
      const ratings = poll.responses
        .filter((r) => r.selectedOption)
        .map((r) => parseInt(r.selectedOption));
      if (ratings.length > 0) {
        poll.analytics.averageRating = (
          ratings.reduce((a, b) => a + b, 0) / ratings.length
        ).toFixed(2);
      }
    }

    poll.analytics.responseRate = (
      (poll.totalResponses / poll.responses.length) *
      100
    ).toFixed(2);

    await poll.save();

    res.status(200).json({
      success: true,
      message: "Poll ended successfully",
      poll,
    });
  } catch (error) {
    console.error("[v0] End Poll Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to end poll",
      error: error.message,
    });
  }
};

// @desc Delete poll
// @route DELETE /api/polls/:id
// @access Private
export const deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this poll",
      });
    }

    // Remove from session
    await Session.findByIdAndUpdate(poll.sessionId, {
      $pull: { polls: poll._id },
    });

    await Poll.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error) {
    console.error("[v0] Delete Poll Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete poll",
      error: error.message,
    });
  }
};
