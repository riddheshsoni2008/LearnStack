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
  condition: {
    type: String,     // e.g. "COMPLETE_TRACK", "STREAK_7", "FIRST_QUIZ"
    required: true
  },
  conditionValue: {
    type: String,     // e.g. track ID, streak count, etc.
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
