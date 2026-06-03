const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

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

    let progress = await Progress.findOne({ userId: req.user._id, lessonId: lesson._id });
    if (progress && progress.completed) {
      return res.status(200).json({ success: true, message: 'Lesson already completed', data: progress });
    }

    const xpEarned = lesson.xpReward || 10;

    progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, lessonId: lesson._id },
      {
        userId: req.user._id,
        trackId: lesson.trackId,
        lessonId: lesson._id,
        completed: true,
        quizScore: 100,
        xpEarned,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update user XP & streak
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;

    const today = new Date().toDateString();
    const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;

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
    }
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        score: 100,
        passed: true,
        xpEarned,
        progress
      }
    });
  } catch (error) {
    res.status(505).json({ success: false, message: error.message });
  }
};

module.exports = { getMyProgress, getTrackProgress, completeLessonDirect };
