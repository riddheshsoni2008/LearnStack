const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { awardXP, updateStreak } = require('../services/xpService');
const { checkAndAwardBadges } = require('../services/badgeService');
const { logExerciseCompletion } = require('../services/exerciseHistoryService');
const { checkAndAwardCertificate } = require('../services/certificateService');

// @desc    Get user's progress for all tracks
// @route   GET /api/progress/me
// @access  Private
const getMyProgress = async (req, res) => {
  try {
    const history = await ExerciseHistoryDaily.find({ userId: req.user._id })
      .populate({
        path: 'completedExercises.trackId',
        select: 'title totalLessons'
      })
      .populate({
        path: 'completedExercises.exerciseId',
        select: 'title weekNumber'
      });

    const progressMap = new Map();
    history.forEach(day => {
      day.completedExercises.forEach(ex => {
        if (ex.exerciseType === 'Lesson' && ex.exerciseId) {
          const lessonIdStr = ex.exerciseId._id ? ex.exerciseId._id.toString() : ex.exerciseId.toString();
          if (!progressMap.has(lessonIdStr)) {
            progressMap.set(lessonIdStr, {
              trackId: ex.trackId,
              lessonId: ex.exerciseId._id || ex.exerciseId,
              completed: true,
              quizScore: ex.score,
              completedAt: ex.completedAt
            });
          }
        }
      });
    });

    res.status(200).json({ success: true, data: Array.from(progressMap.values()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get progress for a specific track
// @route   GET /api/progress/track/:trackId
// @access  Private
const getTrackProgress = async (req, res) => {
  try {
    const history = await ExerciseHistoryDaily.find({ userId: req.user._id })
      .populate({
        path: 'completedExercises.exerciseId',
        select: 'title weekNumber order'
      });

    const progressMap = new Map();
    history.forEach(day => {
      day.completedExercises.forEach(ex => {
        if (ex.exerciseType === 'Lesson' && ex.exerciseId && ex.trackId && ex.trackId.toString() === req.params.trackId) {
          const lessonIdStr = ex.exerciseId._id ? ex.exerciseId._id.toString() : ex.exerciseId.toString();
          if (!progressMap.has(lessonIdStr)) {
            progressMap.set(lessonIdStr, {
              trackId: ex.trackId,
              lessonId: ex.exerciseId._id || ex.exerciseId,
              completed: true,
              quizScore: ex.score,
              completedAt: ex.completedAt
            });
          }
        }
      });
    });

    res.status(200).json({ success: true, data: Array.from(progressMap.values()) });
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
    let existingProgress = null;
    const existingHistory = await ExerciseHistoryDaily.findOne({
      userId: req.user._id,
      completedExercises: {
        $elemMatch: {
          exerciseId: lesson._id,
          title: { $not: / - Quiz$/ }
        }
      }
    });
    
    if (existingHistory) {
      existingProgress = existingHistory.completedExercises.find(
        ex => ex.exerciseId.toString() === lesson._id.toString() && !ex.title.includes(' - Quiz')
      );
    }

    if (existingProgress) {
      return res.status(200).json({
        success: true,
        message: 'Lesson already completed',
        data: {
          score: 100,
          passed: true,
          xpEarned: 0,
          xpBreakdown: [{ label: 'Already completed', amount: 0 }],
          progress: {
            trackId: existingProgress.trackId,
            lessonId: existingProgress.exerciseId,
            completed: true,
            quizScore: existingProgress.score,
            completedAt: existingProgress.completedAt
          },
          gamification: {
            leveledUp: false,
            newBadges: [],
            streak: req.user.streak,
            totalXP: req.user.totalXpEarned,
            xpBalance: req.user.xpBalance
          }
        }
      });
    }

    const baseXP = lesson.xpReward || 10;

    // Log the exercise completion
    await logExerciseCompletion(req.user._id, lesson._id, lesson.title, 100, 'Lesson', lesson.trackId);

    const progress = {
      userId: req.user._id,
      trackId: lesson.trackId,
      lessonId: lesson._id,
      completed: true,
      quizScore: 100,
      xpEarned: baseXP,
      completedAt: new Date()
    };

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

    // ── Check for Track Completion Certificate ──
    const newCertificate = await checkAndAwardCertificate(req.user._id, lesson.trackId);

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
          newCertificate: newCertificate ? {
            certificateId: newCertificate.certificateId,
            verificationUrl: newCertificate.verificationUrl
          } : null,
          streak: updatedUser.streak,
          longestStreak: updatedUser.longestStreak,
          streakBonus: streakInfo.streakBonus || 0,
          totalXP: updatedUser.totalXpEarned,
          xpBalance: updatedUser.xpBalance,
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
