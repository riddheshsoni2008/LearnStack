const mongoose = require('mongoose');

const GameAchievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['LEVEL_COMPLETE', 'BUG_FIX_COMPLETE', 'BOSS_DEFEATED', 'FIRST_CHALLENGE'],
    required: true 
  },
  target: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameAchievement', GameAchievementSchema);
