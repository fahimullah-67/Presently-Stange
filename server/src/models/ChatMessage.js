import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: String,
    senderInitials: String,
    message: {
      type: String,
      required: [true, "Message cannot be empty"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        emoji: String,
        users: [mongoose.Schema.Types.ObjectId],
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file"],
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  { timestamps: true },
);

// Index for efficient querying
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });

// Static method to get recent messages
chatMessageSchema.statics.getRecentMessages = async function (
  sessionId,
  limit = 50,
) {
  return await this.find({
    sessionId,
    isDeleted: false,
  })
    .populate("senderId", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to add reaction
chatMessageSchema.methods.addReaction = function (emoji, userId) {
  const reaction = this.reactions.find((r) => r.emoji === emoji);
  if (reaction) {
    if (!reaction.users.includes(userId)) {
      reaction.users.push(userId);
    }
  } else {
    this.reactions.push({ emoji, users: [userId] });
  }
  return this.save();
};

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
