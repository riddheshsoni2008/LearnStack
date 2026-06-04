const User = require('../models/User');
const XpHistory = require('../models/XpHistory');

// ═══════════════════════════════════════════════════════════════
// XP Service — centralized XP awarding with history tracking
// ═══════════════════════════════════════════════════════════════

// Streak milestone bonuses (one-time awards)
const STREAK_MILESTONES = {
  3: 15,    // 3-day streak bonus
  7: 35,    // 7-day streak bonus  
  14: 75,   // 2-week streak bonus
  30: 200,  // 30-day streak bonus
  60: 400,  // 60-day streak bonus
  100: 1000 // 100-day streak bonus
};

/**
 * Award XP to a user with full tracking
 * @param {string} userId 
 * @param {number} amount - XP amount
 * @param {string} source - 'quiz' | 'lesson' | 'coding_challenge' | 'streak_bonus' | 'perfect_score' | 'daily_challenge'
 * @param {string} description 
 * @param {string} referenceId - optional reference (lessonId, etc.)
 * @returns {object} { user, leveledUp, oldLevel, newLevel, xpAwarded }
 */
const awardXP = async (userId, amount, source, description, referenceId = null) => {
  const user = await User.findById(userId);
  if (!user || amount <= 0) return { user, leveledUp: false, xpAwarded: 0 };

  const oldLevel = user.level;
  user.totalXpEarned += amount;
  await user.save({ validateBeforeSave: false });

  const newLevel = user.level;
  const leveledUp = newLevel > oldLevel;

  // Log to XP history
  await XpHistory.create({
    userId,
    amount,
    source,
    description,
    referenceId,
    levelBefore: oldLevel,
    levelAfter: newLevel
  });

  return { user, leveledUp, oldLevel, newLevel, xpAwarded: amount };
};

/**
 * Update streak and award milestone bonuses
 * @param {object} user - Mongoose user document
 * @returns {object} { streakUpdated, streakBonus, streakBonusMilestone }
 */
const updateStreak = async (user) => {
  const today = new Date().toDateString();
  const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;

  let streakBonus = 0;
  let streakBonusMilestone = null;

  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive === yesterday.toDateString()) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak;
    }

    // Check for streak milestone bonus (one-time per milestone)
    if (STREAK_MILESTONES[user.streak]) {
      streakBonus = STREAK_MILESTONES[user.streak];
      streakBonusMilestone = user.streak;
      user.totalXpEarned += streakBonus;

      await XpHistory.create({
        userId: user._id,
        amount: streakBonus,
        source: 'streak',
        description: `${user.streak}-day streak milestone bonus!`,
        levelBefore: user.level,
        levelAfter: user.level
      });
    }
  }

  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  return { streakUpdated: true, streakBonus, streakBonusMilestone };
};

module.exports = { awardXP, updateStreak, STREAK_MILESTONES };
