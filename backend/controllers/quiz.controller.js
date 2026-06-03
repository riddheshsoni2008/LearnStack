const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Lesson = require('../models/Lesson');

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
    const { answers } = req.body; // { questionId: selectedOptionIndex }
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
    const xpEarned = passed ? (lesson?.xpReward || 10) : 0;

    // Save progress
    if (passed) {
      await Progress.findOneAndUpdate(
        { userId: req.user._id, lessonId: req.params.lessonId },
        {
          userId: req.user._id,
          trackId: lesson.trackId,
          lessonId: req.params.lessonId,
          completed: true,
          quizScore: score,
          xpEarned,
          completedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Update user XP and streak
      const user = await User.findById(req.user._id);
      user.xp += xpEarned;

      // Streak logic: if last active was yesterday, increment streak
      const today = new Date().toDateString();
      const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
          user.streak += 1;
        } else if (lastActive !== today) {
          user.streak = 1; // Reset streak
        }

        if (user.streak > user.longestStreak) {
          user.longestStreak = user.streak;
        }
      }

      user.lastActive = new Date();
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        passed,
        correct,
        total: quiz.questions.length,
        xpEarned,
        results
      }
    });
  } catch (error) {
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
