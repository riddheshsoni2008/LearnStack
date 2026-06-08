const User = require('../models/User');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');

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

const logXpTransaction = async (userId, amount, source, description, referenceId, levelBefore, levelAfter) => {
  const todayString = new Date().toISOString().split('T')[0];
  await ExerciseHistoryDaily.updateOne(
    { userId, date: todayString },
    {
      $setOnInsert: { userId, date: todayString },
      $push: { 
        xpHistory: { 
          amount, 
          source, 
          description, 
          referenceId, 
          levelBefore, 
          levelAfter,
          createdAt: new Date()
        } 
      },
      $inc: { totalXpEarnedToday: amount }
    },
    { upsert: true }
  );
};

const awardXP = async (userId, amount, source, description, referenceId = null) => {
  const user = await User.findById(userId);
  if (!user || amount <= 0) return { user, leveledUp: false, xpAwarded: 0 };

  const oldLevel = user.level;
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalXpEarned: amount } },
    { new: true }
  );

  const newLevel = updatedUser.level;
  const leveledUp = newLevel > oldLevel;

  // Log to XP history
  await logXpTransaction(userId, amount, source, description, referenceId, oldLevel, newLevel);

  return { user: updatedUser, leveledUp, oldLevel, newLevel, xpAwarded: amount };
};

/**
 * Update streak and award milestone bonuses
 * @param {object} user - Mongoose user document
 * @returns {object} { streakUpdated, streakBonus, streakBonusMilestone }
 */
const updateStreak = async (user) => {
  const today = new Date().toDateString();
  const lastExerciseDateRaw = user.lastExerciseDate || user.lastActive;
  const lastExerciseDate = lastExerciseDateRaw ? new Date(lastExerciseDateRaw).toDateString() : null;

  let streakBonus = 0;
  let streakBonusMilestone = null;

  if (lastExerciseDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;
    if (lastExerciseDate === yesterday.toDateString()) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, user.longestStreak);

    // Calculate streak bonus
    if (STREAK_MILESTONES[newStreak]) {
      streakBonus = STREAK_MILESTONES[newStreak];
      streakBonusMilestone = newStreak;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { 
          streak: newStreak, 
          longestStreak: newLongestStreak,
          lastExerciseDate: new Date(),
          lastActive: new Date()
        },
        $inc: {
          totalXpEarned: streakBonus
        }
      },
      { new: true }
    );

    if (streakBonus > 0) {
      await logXpTransaction(
        updatedUser._id,
        streakBonus,
        'streak',
        `${newStreak}-day streak milestone bonus!`,
        null,
        user.level,
        updatedUser.level
      );
    }
  } else {
    // Just update last active time without touching streak
    await User.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } });
  }

  return { streakUpdated: true, streakBonus, streakBonusMilestone };
};

module.exports = { awardXP, updateStreak, STREAK_MILESTONES, logXpTransaction };
