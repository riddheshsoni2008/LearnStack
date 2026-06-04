const User = require('../models/User');

// @desc    Get leaderboard (top users by XP)
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    // Get top 20 users who haven't hidden themselves
    const topUsers = await User.find({ hideFromLeaderboard: { $ne: true } })
      .sort({ xp: -1 })
      .limit(20)
      .select('name avatar xp streak longestStreak badges createdAt');

    const leaderboard = topUsers.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      initial: u.name.charAt(0).toUpperCase(),
      xp: u.xp,
      level: u.level,
      levelTitle: u.levelTitle,
      streak: u.streak,
      badgesCount: u.badges?.length || 0
    }));

    // Get current user's rank
    const currentUser = await User.findById(req.user._id);
    let myRank = null;

    if (currentUser && !currentUser.hideFromLeaderboard) {
      const usersAbove = await User.countDocuments({
        hideFromLeaderboard: { $ne: true },
        xp: { $gt: currentUser.xp }
      });
      myRank = {
        rank: usersAbove + 1,
        _id: currentUser._id,
        name: currentUser.name,
        xp: currentUser.xp,
        level: currentUser.level,
        levelTitle: currentUser.levelTitle,
        streak: currentUser.streak,
        badgesCount: currentUser.badges?.length || 0
      };
    }

    const totalUsers = await User.countDocuments({ hideFromLeaderboard: { $ne: true } });

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        myRank,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle leaderboard privacy
// @route   PUT /api/leaderboard/privacy
// @access  Private
const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.hideFromLeaderboard = !user.hideFromLeaderboard;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      data: { hideFromLeaderboard: user.hideFromLeaderboard }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeaderboard, togglePrivacy };
