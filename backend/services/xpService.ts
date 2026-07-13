import User, { IUser } from '../models/User';
import ExerciseHistoryDaily from '../models/ExerciseHistoryDaily';
import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// XP Service — centralized XP awarding with history tracking
// ═══════════════════════════════════════════════════════════════

// Streak milestone bonuses (one-time awards)
const STREAK_MILESTONES: Record<number, number> = {
  3: 15,    // 3-day streak bonus
  7: 35,
  14: 75,   // 2-week streak bonus
  30: 200,  // 30-day streak bonus
  60: 400,  // 60-day streak bonus
  100: 1000 // 100-day streak bonus
};

const logXpTransaction = async (
  userId: mongoose.Types.ObjectId | string,
  amount: number,
  source: string,
  description: string,
  referenceId: mongoose.Types.ObjectId | string | null,
  levelBefore: number,
  levelAfter: number
): Promise<void> => {
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

const awardXP = async (
  userId: mongoose.Types.ObjectId | string,
  amount: number,
  source: string,
  description: string,
  referenceId: mongoose.Types.ObjectId | string | null = null
): Promise<{ user: any; leveledUp: boolean; oldLevel: number; newLevel: number; xpAwarded: number }> => {
  const user = await User.findById(userId);
  if (!user || amount <= 0) return { user, leveledUp: false, oldLevel: 0, newLevel: 0, xpAwarded: 0 };

  const oldLevel = user.level;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalXpEarned: amount } },
    { new: true }
  );

  const newLevel = updatedUser!.level;
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
const updateStreak = async (user: IUser): Promise<{ streakUpdated: boolean; streakBonus: number; streakBonusMilestone: number | null }> => {
  const todayStr = new Date().toDateString();
  const lastExerciseDateStr = user.lastExerciseDate ? new Date(user.lastExerciseDate).toDateString() : null;

  let streakBonus = 0;
  let streakBonusMilestone: number | null = null;

  if (lastExerciseDateStr === todayStr) {
    await User.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } });
    return { streakUpdated: false, streakBonus: 0, streakBonusMilestone: null };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  let newStreak = user.streak;
  if (lastExerciseDateStr === yesterdayStr) {
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
      updatedUser!._id as mongoose.Types.ObjectId,
      streakBonus,
      'streak',
      `${newStreak}-day streak milestone bonus!`,
      null,
      user.level,
      updatedUser!.level
    );
  }

  return { streakUpdated: true, streakBonus, streakBonusMilestone };
};

export { awardXP, updateStreak, logXpTransaction };
