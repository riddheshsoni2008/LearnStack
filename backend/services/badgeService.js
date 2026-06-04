const Badge = require('../models/Badge');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Track = require('../models/Track');
const XpHistory = require('../models/XpHistory');

// ═══════════════════════════════════════════════════════════════
// Badge Service — centralized badge checking and awarding
// ═══════════════════════════════════════════════════════════════

/**
 * Check all badge conditions for a user and award any newly earned badges.
 * Returns an array of newly awarded badge objects (for toast notifications).
 * 
 * @param {string} userId 
 * @param {object} context - event context { event, lessonId, trackId, quizScore }
 * @returns {Promise<Array>} - newly awarded badges
 */
const checkAndAwardBadges = async (userId, context = {}) => {
  const user = await User.findById(userId).populate('badges');
  if (!user) return [];

  const allBadges = await Badge.find({});
  const earnedBadgeIds = user.badges.map(b => b._id.toString());
  const newlyEarned = [];

  for (const badge of allBadges) {
    // Skip if already earned
    if (earnedBadgeIds.includes(badge._id.toString())) continue;

    const earned = await checkCondition(badge, user, context);
    if (earned) {
      newlyEarned.push(badge);
    }
  }

  // Award all newly earned badges at once
  if (newlyEarned.length > 0) {
    const badgeIds = newlyEarned.map(b => b._id);
    let totalBonusXP = 0;

    for (const badge of newlyEarned) {
      totalBonusXP += badge.xpBonus || 0;
    }

    // Add badge references + bonus XP to user
    user.badges.push(...badgeIds);
    user.totalXpEarned += totalBonusXP;
    user.xpBalance += totalBonusXP;
    await user.save({ validateBeforeSave: false });

    // Log XP history for each badge bonus
    for (const badge of newlyEarned) {
      if (badge.xpBonus > 0) {
        await XpHistory.create({
          userId,
          amount: badge.xpBonus,
          source: 'badge_bonus',
          description: `Badge unlocked: ${badge.name}`,
          referenceId: badge._id,
          levelBefore: user.level,
          levelAfter: user.level
        });
      }
    }
  }

  return newlyEarned;
};

/**
 * Check if a specific badge condition is met
 */
const checkCondition = async (badge, user, context) => {
  const { condition, conditionValue } = badge;

  switch (condition) {
    // ── Lesson milestones ──
    case 'FIRST_LESSON': {
      const count = await Progress.countDocuments({ userId: user._id, completed: true });
      return count >= 1;
    }
    case 'LESSONS_5': {
      const count = await Progress.countDocuments({ userId: user._id, completed: true });
      return count >= 5;
    }
    case 'LESSONS_IN_DAY': {
      // 5 lessons completed in the same day
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const count = await Progress.countDocuments({
        userId: user._id,
        completed: true,
        completedAt: { $gte: todayStart }
      });
      return count >= 5;
    }

    // ── Quiz milestones ──
    case 'FIRST_QUIZ': {
      const count = await Progress.countDocuments({ userId: user._id, completed: true, quizScore: { $gt: 0 } });
      return count >= 1;
    }
    case 'PERFECT_SCORE': {
      return user.perfectQuizzes >= 1;
    }

    // ── Streak milestones ──
    case 'STREAK': {
      const target = parseInt(conditionValue) || 3;
      return user.streak >= target;
    }

    // ── XP milestones ──
    case 'XP_MILESTONE': {
      const target = parseInt(conditionValue) || 100;
      return user.totalXpEarned >= target;
    }

    // ── Track completion (dynamic) ──
    case 'COMPLETE_TRACK': {
      if (!conditionValue) return false;
      const track = await Track.findOne({ title: { $regex: conditionValue, $options: 'i' } });
      if (!track) return false;
      const completedInTrack = await Progress.countDocuments({
        userId: user._id,
        trackId: track._id,
        completed: true
      });
      return completedInTrack >= track.totalLessons;
    }

    // ── All tracks completed ──
    case 'ALL_TRACKS': {
      const tracks = await Track.find({});
      for (const track of tracks) {
        const completedInTrack = await Progress.countDocuments({
          userId: user._id,
          trackId: track._id,
          completed: true
        });
        if (completedInTrack < track.totalLessons) return false;
      }
      return tracks.length > 0;
    }

    // ── Coding challenge milestones ──
    case 'CHALLENGES': {
      const target = parseInt(conditionValue) || 10;
      return (user.completedChallenges || 0) >= target;
    }

    default:
      return false;
  }
};

module.exports = { checkAndAwardBadges };
