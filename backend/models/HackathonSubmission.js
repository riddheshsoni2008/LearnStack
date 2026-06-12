const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// Hackathon Submission Schema — Per-Round Submissions
// ═══════════════════════════════════════════════════════════════

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HackathonQuestion',
    required: true
  },
  answer: { type: String, default: '' },
  selectedOptionIndex: { type: Number, default: -1 }, // for MCQ
  isCorrect: { type: Boolean, default: false },
  pointsAwarded: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 } // seconds per question
}, { _id: false });

const HackathonSubmissionSchema = new mongoose.Schema({
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roundNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },

  // ── Answers ──
  answers: [AnswerSchema],
  assignedQuestionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HackathonQuestion'
  }],

  // ── Scoring ──
  totalScore: { type: Number, default: 0 },
  maxPossibleScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  totalTimeTaken: { type: Number, default: 0 }, // seconds

  // ── Submission Info ──
  startedAt: { type: Date },
  submittedAt: { type: Date },
  autoSubmitted: { type: Boolean, default: false },

  // ── Detailed Stats ──
  stats: {
    answered: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 }
  },

  // ── Project Submission (Round 3) ──
  projectUrl: { type: String, default: '' },
  projectDescription: { type: String, default: '' },
  projectTechStack: [{ type: String }],

  // ── Judge Evaluation (Round 3) ──
  judgeScores: [{
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    evaluatedAt: { type: Date, default: Date.now }
  }],

  // ── Status ──
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'AUTO_SUBMITTED', 'COMPLETED', 'QUALIFIED', 'DISQUALIFIED', 'evaluated'],
    default: 'NOT_STARTED',
    index: true
  }
}, {
  timestamps: true
});

// ── One submission per user per hackathon per round ──
HackathonSubmissionSchema.index(
  { hackathonId: 1, userId: 1, roundNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model('HackathonSubmission', HackathonSubmissionSchema);
