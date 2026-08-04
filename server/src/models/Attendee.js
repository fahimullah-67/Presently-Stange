const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    email: String,
    status: {
      type: String,
      enum: ['invited', 'registered', 'joined', 'left', 'no-show'],
      default: 'registered',
    },
    role: {
      type: String,
      enum: ['organizer', 'speaker', 'attendee'],
      default: 'attendee',
    },
    joinTime: Date,
    leaveTime: Date,
    duration: Number, // in seconds
    isActive: {
      type: Boolean,
      default: false,
    },
    engagement: {
      pollsAnswered: { type: Number, default: 0 },
      messagesCount: { type: Number, default: 0 },
      reactionsCount: { type: Number, default: 0 },
      questionsAsked: { type: Number, default: 0 },
      engagementScore: { type: Number, default: 0 },
    },
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      browser: String,
      platform: String,
    },
    participationHistory: [
      {
        pollId: mongoose.Schema.Types.ObjectId,
        responded: Boolean,
        responseTime: Number,
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },
  },
  { timestamps: true }
);

// Calculate attendance duration
attendeeSchema.pre('save', function (next) {
  if (this.joinTime && this.leaveTime) {
    this.duration = Math.floor((this.leaveTime - this.joinTime) / 1000);
  }
  next();
});

// Index for efficient querying
attendeeSchema.index({ sessionId: 1, userId: 1 });
attendeeSchema.index({ sessionId: 1, isActive: 1 });

// Static method to get active attendees
attendeeSchema.statics.getActiveAttendees = async function (sessionId) {
  return await this.find({
    sessionId,
    isActive: true,
    status: 'joined',
  }).populate('userId', 'name email avatar');
};

// Instance method to update engagement
attendeeSchema.methods.updateEngagement = function (type) {
  switch (type) {
    case 'poll':
      this.engagement.pollsAnswered += 1;
      break;
    case 'message':
      this.engagement.messagesCount += 1;
      break;
    case 'reaction':
      this.engagement.reactionsCount += 1;
      break;
    case 'question':
      this.engagement.questionsAsked += 1;
      break;
  }
  
  // Calculate engagement score (0-100)
  const baseScore = Math.min(
    (this.engagement.pollsAnswered * 10 +
      this.engagement.messagesCount * 5 +
      this.engagement.reactionsCount * 2 +
      this.engagement.questionsAsked * 15) / 10,
    100
  );
  this.engagement.engagementScore = Math.round(baseScore);
  
  return this.save();
};

module.exports = mongoose.model('Attendee', attendeeSchema);
