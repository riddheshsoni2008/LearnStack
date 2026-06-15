const mongoose = require('mongoose');

const HackathonChallengeSchema = new mongoose.Schema({
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeTitle: {
    type: String,
    required: true
  },
  businessScenario: {
    type: String,
    default: ''
  },
  problemStatement: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  bonusFeatures: [{
    type: String
  }],
  evaluationCriteria: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Ensure a user only gets one challenge per hackathon in this automated flow
HackathonChallengeSchema.index({ hackathonId: 1, assignedTo: 1 }, { unique: true });

module.exports = mongoose.model('HackathonChallenge', HackathonChallengeSchema);
