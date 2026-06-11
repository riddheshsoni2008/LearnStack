const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// Hackathon Schema
// ═══════════════════════════════════════════════════════════════

const RoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true, enum: [1, 2, 3] },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'intermediate', 'advanced'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // minutes
  qualifyingScore: { type: Number, default: 50 }, // percentage to qualify
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HackathonQuestion' }],
  type: { type: String, enum: ['quiz', 'problem_solving', 'project'], required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' }
}, { _id: true });

const PreviousWinnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rank: { type: Number, required: true },
  hackathonTitle: { type: String },
  year: { type: Number },
  college: { type: String, default: '' },
  state: { type: String, default: '' },
  projectTitle: { type: String, default: '' }
}, { _id: false });

const HackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Hackathon title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '', maxlength: 300 },
  bannerImage: { type: String, default: '' },

  // ── Status & Dates ──
  status: {
    type: String,
    enum: ['draft', 'registration_open', 'active', 'completed', 'archived'],
    default: 'draft',
    index: true
  },
  registrationStart: { type: Date },
  registrationEnd: { type: Date },
  startDate: { type: Date },
  endDate: { type: Date },

  // ── Prize Pool ──
  prizePool: {
    first: { type: String, default: '' },
    second: { type: String, default: '' },
    third: { type: String, default: '' },
    description: { type: String, default: '' },
    totalValue: { type: String, default: '' }
  },

  // ── Content Sections ──
  rules: [{ type: String }],
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  sponsors: [{
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    url: { type: String, default: '' },
    tier: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze'], default: 'silver' }
  }],
  previousWinners: [PreviousWinnerSchema],

  // ── Participant Settings ──
  participantLimitMode: {
    type: String,
    enum: ['unlimited', 'custom'],
    default: 'unlimited'
  },
  maxParticipants: { type: Number, default: 0 }, // 0 = unlimited when mode is 'unlimited'
  currentParticipants: { type: Number, default: 0 },

  // ── Registration Type (Future Payment Architecture) ──
  registrationType: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  entryFee: { type: Number, default: 0 },

  // ── Question Bank Mode ──
  questionBankMode: {
    type: String,
    enum: ['global', 'private'],
    default: 'global'
  },

  // ── Rounds ──
  rounds: [RoundSchema],

  // ── Future Architecture: Hackathon Mode (Solo / Team) ──
  // NOTE: Team features NOT implemented. Schema placeholders only.
  hackathonMode: {
    type: String,
    enum: ['solo', 'team'],
    default: 'solo'
  },
  teamSettings: {
    minTeamSize: { type: Number, default: 2 },
    maxTeamSize: { type: Number, default: 5 },
    allowSoloInTeamMode: { type: Boolean, default: false }
  },

  // ── Future Architecture: Announcements ──
  // NOTE: Not implemented. Placeholder for future feature.
  announcements: [{
    title: { type: String },
    message: { type: String },
    postedAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
  }],

  // ── Future Architecture: Referral System ──
  // NOTE: Not implemented. Placeholder for future feature.
  referralSettings: {
    enabled: { type: Boolean, default: false },
    bonusXp: { type: Number, default: 0 },
    maxReferrals: { type: Number, default: 10 }
  },

  // ── Tags & Meta ──
  tags: [{ type: String }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// ── Auto-generate slug from title ──
HackathonSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
});

// ── Indexes ──
HackathonSchema.index({ slug: 1 });
HackathonSchema.index({ status: 1, startDate: -1 });
HackathonSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Hackathon', HackathonSchema);
