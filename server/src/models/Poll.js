const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['yes-no', 'multiple-choice', 'rating', 'text', 'ranking'],
      default: 'yes-no',
    },
    options: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        text: String,
        votes: { type: Number, default: 0 },
      },
    ],
    responses: [
      {
        respondentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        respondentName: String,
        selectedOption: mongoose.Schema.Types.ObjectId,
        textResponse: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    showLiveResults: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    totalResponses: {
      type: Number,
      default: 0,
    },
    analytics: {
      responseRate: Number,
      averageRating: Number,
      mostSelected: String,
    },
  },
  { timestamps: true }
);

// Calculate total responses before saving
pollSchema.pre('save', function (next) {
  this.totalResponses = this.responses.length;
  next();
});

// Static method to get poll results
pollSchema.statics.getPollResults = async function (pollId) {
  const poll = await this.findById(pollId);
  if (!poll) return null;

  const results = {
    question: poll.question,
    type: poll.type,
    totalResponses: poll.totalResponses,
    options: poll.options.map((option) => ({
      text: option.text,
      votes: option.votes,
      percentage: poll.totalResponses > 0 ? ((option.votes / poll.totalResponses) * 100).toFixed(2) : 0,
    })),
  };

  return results;
};

module.exports = mongoose.model('Poll', pollSchema);
