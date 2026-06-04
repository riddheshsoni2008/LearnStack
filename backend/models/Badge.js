const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,     // emoji or image URL
    default: '🏅'
  },
  description: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  condition: {
    type: String,     // e.g. "COMPLETE_TRACK", "STREAK_7", "FIRST_QUIZ"
    required: true
  },
  conditionValue: {
    type: String,     // e.g. track slug, streak count, XP threshold
    default: ''
  },
  xpBonus: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', BadgeSchema);
