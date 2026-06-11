const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// Hackathon Registration Schema
// Any logged-in user can register — NO Arcade dependency
// ═══════════════════════════════════════════════════════════════

const HackathonRegistrationSchema = new mongoose.Schema({
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
  registeredAt: {
    type: Date,
    default: Date.now
  },

  // ── Participant Details ──
  collegeName: { type: String, default: '', trim: true },
  studentId: { type: String, default: '', trim: true },
  githubUrl: { type: String, default: '', trim: true },
  linkedinUrl: { type: String, default: '', trim: true },
  portfolioUrl: { type: String, default: '', trim: true },
  resumeUrl: { type: String, default: '', trim: true },
  state: { type: String, default: '', trim: true },

  // ── Status & Progress ──
  status: {
    type: String,
    enum: ['registered', 'participating', 'qualified', 'disqualified', 'winner', 'runner_up'],
    default: 'registered',
    index: true
  },
  currentRound: { type: Number, default: 1 },
  totalScore: { type: Number, default: 0 },
  totalTimeTaken: { type: Number, default: 0 }, // seconds
  rank: { type: Number, default: 0 },

  // ── Future Payment Architecture ──
  // NOTE: Payment NOT implemented. Schema placeholders only.
  paymentStatus: {
    type: String,
    enum: ['not_required', 'pending', 'completed', 'failed', 'refunded'],
    default: 'not_required'
  },
  transactionId: { type: String, default: '' },
  paymentProvider: { type: String, enum: ['none', 'razorpay', 'stripe'], default: 'none' },
  paymentAmount: { type: Number, default: 0 },

  // ── Certificate ──
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  },

  // ── Future Architecture: Team Support ──
  // NOTE: Team features NOT implemented. Schema placeholders only.
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
    // ref: 'HackathonTeam' — future model
  },
  isTeamLeader: { type: Boolean, default: false },

  // ── Future Architecture: Referral ──
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCode: { type: String, default: '' }

}, {
  timestamps: true
});

// ── Ensure one registration per user per hackathon ──
HackathonRegistrationSchema.index({ hackathonId: 1, userId: 1 }, { unique: true });

// ── Leaderboard query index ──
HackathonRegistrationSchema.index({ hackathonId: 1, totalScore: -1, totalTimeTaken: 1 });

module.exports = mongoose.model('HackathonRegistration', HackathonRegistrationSchema);
