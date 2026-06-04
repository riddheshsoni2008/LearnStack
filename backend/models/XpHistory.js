const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// XP History — audit trail for all XP transactions
// ═══════════════════════════════════════════════════════════════
const XpHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    enum: ['quiz', 'lesson', 'coding_challenge', 'streak', 'badge', 'perfect_score', 'daily_challenge', 'mystery_box', 'store_purchase', 'level_up'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null  // lessonId, badgeId, etc.
  },
  levelBefore: {
    type: Number,
    default: 1
  },
  levelAfter: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for fetching user's history efficiently
XpHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('XpHistory', XpHistorySchema);
