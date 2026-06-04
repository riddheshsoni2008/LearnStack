const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { awardXP, updateStreak } = require('../services/xpService');
const { checkAndAwardBadges } = require('../services/badgeService');

// @desc    Get user's progress for all tracks
// @route   GET /api/progress/me
// @access  Private
const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id, completed: true })
      .populate('trackId', 'title totalLessons')
      .populate('lessonId', 'title weekNumber');

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get progress for a specific track
// @route   GET /api/progress/track/:trackId
// @access  Private
const getTrackProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      userId: req.user._id,
      trackId: req.params.trackId,
      completed: true
    }).populate('lessonId', 'title weekNumber order');

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete a lesson directly (without quiz)
// @route   POST /api/progress/complete/:lessonId
// @access  Private
const completeLessonDirect = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check if already completed (prevent XP farming)
    let existingProgress = await Progress.findOne({ userId: req.user._id, lessonId: lesson._id });
    if (existingProgress && existingProgress.completed) {
      return res.status(200).json({
        success: true,
        message: 'Lesson already completed',
        data: {
          score: 100,
          passed: true,
          xpEarned: 0,
          xpBreakdown: [{ label: 'Already completed', amount: 0 }],
          progress: existingProgress,
          gamification: {
            leveledUp: false,
            newBadges: [],
            streak: req.user.streak,
            totalXP: req.user.xp
          }
        }
      });
    }

    const baseXP = lesson.xpReward || 10;

    // Save progress
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, lessonId: lesson._id },
      {
        userId: req.user._id,
        trackId: lesson.trackId,
        lessonId: lesson._id,
        completed: true,
        quizScore: 100,
        xpEarned: baseXP,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // ── Gamification ──
    let totalXpEarned = 0;
    let xpBreakdown = [];

    // Award XP
    const xpResult = await awardXP(
      req.user._id, baseXP, 'lesson',
      `Completed lesson: ${lesson.title}`,
      lesson._id
    );
    totalXpEarned += baseXP;
    xpBreakdown.push({ label: 'Lesson Complete', amount: baseXP });

    // Update streak
    const user = await User.findById(req.user._id);
    const streakInfo = await updateStreak(user);
    if (streakInfo.streakBonus > 0) {
      totalXpEarned += streakInfo.streakBonus;
      xpBreakdown.push({ label: `🔥 ${streakInfo.streakBonusMilestone}-Day Streak!`, amount: streakInfo.streakBonus });
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(req.user._id, {
      event: 'lesson_complete',
      lessonId: lesson._id,
      trackId: lesson.trackId
    });
    if (newBadges.length > 0) {
      const badgeBonusTotal = newBadges.reduce((sum, b) => sum + (b.xpBonus || 0), 0);
      if (badgeBonusTotal > 0) {
        totalXpEarned += badgeBonusTotal;
        xpBreakdown.push({ label: `🏆 Badge Bonus (${newBadges.length})`, amount: badgeBonusTotal });
      }
    }

    // Fetch updated user
    const updatedUser = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        score: 100,
        passed: true,
        xpEarned: totalXpEarned,
        xpBreakdown,
        progress,
        gamification: {
          leveledUp: xpResult.leveledUp,
          oldLevel: xpResult.oldLevel,
          newLevel: xpResult.newLevel,
          newBadges: newBadges.map(b => ({
            _id: b._id,
            name: b.name,
            icon: b.icon,
            description: b.description,
            rarity: b.rarity,
            xpBonus: b.xpBonus
          })),
          streak: updatedUser.streak,
          longestStreak: updatedUser.longestStreak,
          streakBonus: streakInfo.streakBonus || 0,
          totalXP: updatedUser.xp,
          level: updatedUser.level,
          levelTitle: updatedUser.levelTitle,
          currentLevelProgress: updatedUser.currentLevelProgress
        }
      }
    });
  } catch (error) {
    console.error('Lesson complete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyProgress, getTrackProgress, completeLessonDirect };
