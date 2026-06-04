const Badge = require('../models/Badge');
const User = require('../models/User');
const XpHistory = require('../models/XpHistory');

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Private
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({}).sort({ rarity: 1, name: 1 });
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's earned badges
// @route   GET /api/badges/me
// @access  Private
const getMyBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    res.status(200).json({
      success: true,
      data: user.badges || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's XP history
// @route   GET /api/badges/xp-history
// @access  Private
const getXpHistory = async (req, res) => {
  try {
    const history = await XpHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllBadges, getMyBadges, getXpHistory };
