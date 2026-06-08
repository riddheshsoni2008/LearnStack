const Quiz = require('../models/Quiz');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const { awardXP, updateStreak } = require('../services/xpService');
const { checkAndAwardBadges } = require('../services/badgeService');
const { logExerciseCompletion } = require('../services/exerciseHistoryService');
const { checkAndAwardCertificate } = require('../services/certificateService');

// @desc    Get quiz for a lesson
// @route   GET /api/quiz/:lessonId
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this lesson' });
    }

    // Don't send correct answers to frontend
    const safeQuestions = quiz.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: quiz._id,
        lessonId: quiz.lessonId,
        questions: safeQuestions,
        passingScore: quiz.passingScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quiz/:lessonId/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Calculate score
    let correct = 0;
    const results = quiz.questions.map((q) => {
      const userAnswer = answers[q._id.toString()];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        questionId: q._id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Get the lesson for XP reward
    const lesson = await Lesson.findById(req.params.lessonId);
    const baseXP = lesson?.xpReward || 20;

    // ── Gamification response data ──
    let totalXpEarned = 0;
    let xpBreakdown = [];
    let leveledUp = false;
    let oldLevel = 0;
    let newLevel = 0;
    let newBadges = [];
    let streakInfo = {};
    let isPerfectScore = score === 100;

    if (passed) {
      // Check if first-time pass (prevent XP farming)
      const existingHistory = await ExerciseHistoryDaily.findOne({
        userId: req.user._id,
        "completedExercises.exerciseId": req.params.lessonId
      });
      const isFirstTimePass = !existingHistory;

      // Log exercise completion
      await logExerciseCompletion(req.user._id, lesson._id, `${lesson.title} - Quiz`, score, 'Lesson', lesson.trackId);

      // ── Award XP (first-time only gets full reward) ──
      if (isFirstTimePass) {
        const result = await awardXP(
          req.user._id, baseXP, 'quiz',
          `Passed quiz: ${lesson.title}`,
          lesson._id
        );
        totalXpEarned += baseXP;
        xpBreakdown.push({ label: 'Quiz Passed', amount: baseXP });
        leveledUp = result.leveledUp;
        oldLevel = result.oldLevel;
        newLevel = result.newLevel;
      } else {
        // Retry: award small XP
        const retryXP = 5;
        await awardXP(req.user._id, retryXP, 'quiz', `Re-passed quiz: ${lesson.title}`, lesson._id);
        totalXpEarned += retryXP;
        xpBreakdown.push({ label: 'Quiz Re-pass', amount: retryXP });
      }

      // ── Perfect score bonus ──
      if (isPerfectScore && isFirstTimePass) {
        const perfectBonus = 10;
        const user = await User.findById(req.user._id);
        user.perfectQuizzes = (user.perfectQuizzes || 0) + 1;
        await user.save({ validateBeforeSave: false });

        await awardXP(req.user._id, perfectBonus, 'perfect_score', `Perfect score on: ${lesson.title}`, lesson._id);
        totalXpEarned += perfectBonus;
        xpBreakdown.push({ label: '⭐ Perfect Score!', amount: perfectBonus });
      }

      // ── Update streak ──
      const user = await User.findById(req.user._id);
      streakInfo = await updateStreak(user);
      if (streakInfo.streakBonus > 0) {
        totalXpEarned += streakInfo.streakBonus;
        xpBreakdown.push({ label: `🔥 ${streakInfo.streakBonusMilestone}-Day Streak!`, amount: streakInfo.streakBonus });
      }

      // ── Check for new badges ──
      newBadges = await checkAndAwardBadges(req.user._id, {
        event: 'quiz_pass',
        lessonId: lesson._id,
        trackId: lesson.trackId,
        quizScore: score
      });
      if (newBadges.length > 0) {
        const badgeBonusTotal = newBadges.reduce((sum, b) => sum + (b.xpBonus || 0), 0);
        if (badgeBonusTotal > 0) {
          totalXpEarned += badgeBonusTotal;
          xpBreakdown.push({ label: `🏆 Badge Bonus (${newBadges.length})`, amount: badgeBonusTotal });
        }
      }
    }

    // Fetch updated user for response
    const updatedUser = await User.findById(req.user._id);

    // ── Check for Track Completion Certificate ──
    let newCertificate = null;
    if (passed) {
      newCertificate = await checkAndAwardCertificate(req.user._id, lesson.trackId);
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        passed,
        correct,
        total: quiz.questions.length,
        xpEarned: totalXpEarned,
        xpBreakdown,
        results,
        // Gamification data
        gamification: {
          leveledUp,
          oldLevel,
          newLevel,
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
    console.error('Quiz submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a quiz for a lesson (admin)
// @route   POST /api/quiz
// @access  Private/Admin
const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuiz, submitQuiz, createQuiz };
