import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a session title'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: String,
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    actualStartTime: Date,
    actualEndTime: Date,
    duration: Number, // in seconds
    maxAttendees: {
      type: Number,
      default: null,
    },
    attendees: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        email: String,
        joinedAt: Date,
        leftAt: Date,
        isActive: Boolean,
        role: {
          type: String,
          enum: ['organizer', 'speaker', 'attendee'],
          default: 'attendee',
        },
      },
    ],
    polls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
      },
    ],
    settings: {
      allowChat: { type: Boolean, default: true },
      allowPolls: { type: Boolean, default: true },
      allowQA: { type: Boolean, default: true },
      recordSession: { type: Boolean, default: false },
      requireLogin: { type: Boolean, default: false },
    },
    analytics: {
      totalAttendees: { type: Number, default: 0 },
      peakAttendance: Number,
      totalPolls: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      engagementScore: Number,
    },
    metadata: {
      videoUrl: String,
      recordingUrl: String,
      tags: [String],
    },
  },
  { timestamps: true }
);

// Calculate session duration
sessionSchema.pre('save', function (next) {
  if (this.actualStartTime && this.actualEndTime) {
    this.duration = Math.floor((this.actualEndTime - this.actualStartTime) / 1000);
  }
  next();
});

// Static method to get active sessions
sessionSchema.statics.getActiveSessions = async function () {
  return await this.find({
    status: 'live',
    actualStartTime: { $exists: true },
  }).populate('organizerId', 'name email');
};

// Instance method to add attendee
sessionSchema.methods.addAttendee = function (attendeeData) {
  this.attendees.push(attendeeData);
  this.analytics.totalAttendees = this.attendees.length;
  return this.save();
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
