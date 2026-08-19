import ChatMessage from "../models/ChatMessage.js";
import Session from "../models/Session.js";
import Attendee from "../models/Attendee.js";


export const sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message, messageType, attachments, mentions } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const chatMessage = await ChatMessage.create({
      sessionId,
      senderId: req.user._id,
      senderName: req.user.name,
      senderInitials: req.user.name.substring(0, 2).toUpperCase(),
      message,
      messageType: messageType || "text",
      attachments: attachments || [],
      mentions: mentions || [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    
    session.analytics.totalMessages =
      (session.analytics.totalMessages || 0) + 1;
    await session.save();

    
    const attendee = await Attendee.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (attendee) {
      await attendee.updateEngagement("message");
    }

    // Populate sender info
    await chatMessage.populate("senderId", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: chatMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};


export const getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await ChatMessage.find({
      sessionId,
      isDeleted: false,
    })
      .populate("senderId", "name email avatar")
      .populate("mentions", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalMessages = await ChatMessage.countDocuments({
      sessionId,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        total: totalMessages,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error("Get Messages Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};



export const updateMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const chatMessage = await ChatMessage.findById(req.params.id);

    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (chatMessage.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this message",
      });
    }

    chatMessage.message = message;
    chatMessage.isEdited = true;
    chatMessage.editedAt = new Date();
    await chatMessage.save();

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: chatMessage,
    });
  } catch (error) {
    console.error("Update Message Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
      error: error.message,
    });
  }
};



export const deleteMessage = async (req, res, next) => {
  try {
    const chatMessage = await ChatMessage.findById(req.params.id);

    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (chatMessage.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    chatMessage.isDeleted = true;
    chatMessage.deletedAt = new Date();
    await chatMessage.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("[v0] Delete Message Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};




export const addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;

    const chatMessage = await ChatMessage.findById(req.params.id);

    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    await chatMessage.addReaction(emoji, req.user._id);

    // Update attendee engagement
    const attendee = await Attendee.findOne({
      sessionId: chatMessage.sessionId,
      userId: req.user._id,
    });

    if (attendee) {
      await attendee.updateEngagement("reaction");
    }

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      data: chatMessage,
    });
  } catch (error) {
    console.error("Add Reaction Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add reaction",
      error: error.message,
    });
  }
};




export const pinMessage = async (req, res, next) => {
  try {
    const chatMessage = await ChatMessage.findById(req.params.id);

    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Get the session
    const session = await Session.findById(chatMessage.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Only session organizer can pin/unpin
    if (session.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the session organizer can pin or unpin messages",
      });
    }

    // Toggle pin
    chatMessage.isPinned = !chatMessage.isPinned;

    await chatMessage.save();

    res.status(200).json({
      success: true,
      message: chatMessage.isPinned
        ? "Message pinned successfully"
        : "Message unpinned successfully",
      data: chatMessage,
    });
  } catch (error) {
    console.error("Pin Message Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to pin message",
      error: error.message,
    });
  }
};