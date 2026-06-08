const Badge = require('../models/Badge');
const User = require('../models/User');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');

const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({}).sort({ rarity: 1, name: 1 });
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const getXpHistory = async (req, res) => {
  try {
    const historyDocs = await ExerciseHistoryDaily.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    let xpHistory = [];
    historyDocs.forEach(doc => {
      if (doc.xpHistory && doc.xpHistory.length > 0) {
        xpHistory = xpHistory.concat(doc.xpHistory);
      }
    });

    xpHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    xpHistory = xpHistory.slice(0, 50);

    res.status(200).json({ success: true, data: xpHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllBadges, getMyBadges, getXpHistory };
