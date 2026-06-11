const Track = require('../models/Track');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

// @desc    Get public stats
// @route   GET /api/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const tracksCount = await Track.countDocuments({ isPublished: true });
    const lessonsCount = await Lesson.countDocuments({ isPublished: true });
    
    // Aggregation for total quiz questions
    const quizResult = await Quiz.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: { $size: "$questions" } }
        }
      }
    ]);
    const questionsCount = quizResult[0]?.totalQuestions || 0;

    const usersCount = await User.countDocuments();
    const certificatesCount = await Certificate.countDocuments({ isValid: true });

    // Sum of all XP earned
    const xpResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalXp: { $sum: "$totalXpEarned" }
        }
      }
    ]);
    const totalXp = xpResult[0]?.totalXp || 0;

    // Highest streak
    const maxStreakResult = await User.findOne().sort({ longestStreak: -1 }).select('longestStreak').lean();
    const maxStreak = maxStreakResult?.longestStreak || 0;

    res.status(200).json({
      success: true,
      data: {
        tracks: tracksCount,
        lessons: lessonsCount,
        questions: questionsCount,
        users: usersCount,
        certificates: certificatesCount,
        totalXp: totalXp,
        maxStreak: maxStreak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPublicStats };
