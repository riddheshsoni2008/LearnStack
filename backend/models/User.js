const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ═══════════════════════════════════════════════════════════════
// XP Level Thresholds — continuous, no gaps
// ═══════════════════════════════════════════════════════════════
const LEVEL_THRESHOLDS = [
  0, 50, 120, 200, 300, 420, 560, 720, 900, 1100,    // 1–10
  1320, 1560, 1820, 2100, 2400, 2720, 3060, 3420, 3800, 4200,  // 11–20
  4620, 5060, 5520, 6000, 6500, 7020, 7560, 8120, 8700, 9300,  // 21–30
  9920, 10560, 11220, 11900, 12600, 13320, 14060, 14820, 15600, 16400, // 31–40
  17220, 18060, 18920, 19800, 20700, 21620, 22560, 23520, 24500, 25500  // 41–50
];

const LEVEL_TITLES = {
  1: 'Newbie',
  5: 'Beginner',
  10: 'Learner',
  15: 'Coder',
  20: 'Developer',
  25: 'Pro Developer',
  30: 'Expert',
  35: 'Senior Dev',
  40: 'Code Ninja',
  45: 'Architect',
  50: 'Full Stack Master'
};

// ═══════════════════════════════════════════════════════════════
// User Schema
// ═══════════════════════════════════════════════════════════════
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: 6,
    select: false  // don't return password in queries by default
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  xp: {
    type: Number,
    default: 0,
    index: true  // Index for leaderboard queries
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  completedChallenges: {
    type: Number,
    default: 0
  },
  perfectQuizzes: {
    type: Number,
    default: 0
  },
  hideFromLeaderboard: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════════
// Virtual: Computed level from XP (never stored)
// ═══════════════════════════════════════════════════════════════
UserSchema.virtual('level').get(function () {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (this.xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 50);
});

// Virtual: Level title
UserSchema.virtual('levelTitle').get(function () {
  const level = this.level;
  let title = 'Newbie';
  const titleKeys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => a - b);
  for (const key of titleKeys) {
    if (level >= key) {
      title = LEVEL_TITLES[key];
    }
  }
  return title;
});

// Virtual: XP needed for next level
UserSchema.virtual('xpToNextLevel').get(function () {
  const level = this.level;
  if (level >= 50) return 0;
  return LEVEL_THRESHOLDS[level] - this.xp;
});

// Virtual: Current level XP range and progress %
UserSchema.virtual('currentLevelProgress').get(function () {
  const level = this.level;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = level >= 50 ? currentThreshold : LEVEL_THRESHOLDS[level];
  const xpIntoLevel = this.xp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  const percent = xpForLevel > 0 ? Math.round((xpIntoLevel / xpForLevel) * 100) : 100;
  return {
    currentXP: this.xp,
    levelStartXP: currentThreshold,
    levelEndXP: nextThreshold,
    xpIntoLevel,
    xpForLevel,
    percent: Math.min(percent, 100)
  };
});

// ═══════════════════════════════════════════════════════════════
// Index for leaderboard
// ═══════════════════════════════════════════════════════════════
UserSchema.index({ xp: -1 });
UserSchema.index({ hideFromLeaderboard: 1, xp: -1 });

// ═══════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export thresholds for use in other modules
module.exports = mongoose.model('User', UserSchema);
module.exports.LEVEL_THRESHOLDS = LEVEL_THRESHOLDS;
module.exports.LEVEL_TITLES = LEVEL_TITLES;
