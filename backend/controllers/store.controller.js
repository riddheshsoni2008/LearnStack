const User = require('../models/User');
const XpHistory = require('../models/XpHistory');
const { STORE_ITEMS, MYSTERY_BOX_COST, MYSTERY_BOX_REWARDS } = require('../config/storeItems');

// @desc    Get store items
// @route   GET /api/store
// @access  Private
const getStoreItems = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        items: STORE_ITEMS,
        mysteryBoxCost: MYSTERY_BOX_COST
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Purchase store item
// @route   POST /api/store/purchase
// @access  Private
const purchaseItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = STORE_ITEMS.find(i => i.id === itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const user = await User.findById(req.user._id);

    // Check balance
    if (user.xpBalance < item.cost) {
      return res.status(400).json({ success: false, message: 'Not enough XP' });
    }

    // Check if already owned
    let ownedArray = [];
    if (item.type === 'theme') ownedArray = user.ownedThemes;
    if (item.type === 'border') ownedArray = user.ownedBorders;
    if (item.type === 'title') ownedArray = user.ownedTitles;

    if (ownedArray.includes(item.id)) {
      return res.status(400).json({ success: false, message: 'You already own this item' });
    }

    // Process purchase
    user.xpBalance -= item.cost;

    if (item.type === 'theme') user.ownedThemes.push(item.id);
    if (item.type === 'border') user.ownedBorders.push(item.id);
    if (item.type === 'title') user.ownedTitles.push(item.id);

    await user.save();

    // Log XP History
    await XpHistory.create({
      userId: user._id,
      amount: -item.cost,
      source: 'store_purchase',
      description: `Purchased ${item.name}`,
      levelBefore: user.level,
      levelAfter: user.level
    });

    res.status(200).json({
      success: true,
      message: 'Purchase successful!',
      data: {
        xpBalance: user.xpBalance,
        ownedThemes: user.ownedThemes,
        ownedBorders: user.ownedBorders,
        ownedTitles: user.ownedTitles
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Open Mystery Box
// @route   POST /api/store/mystery-box
// @access  Private
const openMysteryBox = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.xpBalance < MYSTERY_BOX_COST) {
      return res.status(400).json({ success: false, message: 'Not enough XP' });
    }

    // Deduct cost
    user.xpBalance -= MYSTERY_BOX_COST;

    // Determine reward based on weights
    const totalWeight = MYSTERY_BOX_REWARDS.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let selectedReward = MYSTERY_BOX_REWARDS[0];

    for (const reward of MYSTERY_BOX_REWARDS) {
      if (randomNum < reward.weight) {
        selectedReward = reward;
        break;
      }
      randomNum -= reward.weight;
    }

    // Apply reward
    if (selectedReward.type === 'xp') {
      user.totalXpEarned += selectedReward.amount;
      user.xpBalance += selectedReward.amount;
    } else if (['theme', 'border', 'title'].includes(selectedReward.type)) {
      let ownedArray = [];
      if (selectedReward.type === 'theme') ownedArray = user.ownedThemes;
      if (selectedReward.type === 'border') ownedArray = user.ownedBorders;
      if (selectedReward.type === 'title') ownedArray = user.ownedTitles;

      if (!ownedArray.includes(selectedReward.itemId)) {
        ownedArray.push(selectedReward.itemId);
      } else {
        // Fallback: give 2 XP if already owned
        user.totalXpEarned += 2;
        user.xpBalance += 2;
        selectedReward = { ...selectedReward, fallback: 'Already owned. Granted +2 XP instead!' };
      }
    } else if (selectedReward.type === 'badge') {
      const Badge = require('../models/Badge');
      const badge = await Badge.findOne({ condition: selectedReward.badgeCondition });

      if (badge) {
        if (!user.badges.includes(badge._id)) {
          user.badges.push(badge._id);
          user.totalXpEarned += badge.xpBonus || 0;
          user.xpBalance += badge.xpBonus || 0;

          if (badge.xpBonus > 0) {
            await XpHistory.create({
              userId: user._id,
              amount: badge.xpBonus,
              source: 'badge',
              description: `Badge unlocked: ${badge.name}`,
              referenceId: badge._id,
              levelBefore: user.level,
              levelAfter: user.level
            });
          }
        } else {
          user.totalXpEarned += 5;
          user.xpBalance += 5;
          selectedReward = { ...selectedReward, fallback: 'Already owned. Granted +5 XP instead!' };
        }
      }
    }

    await user.save();

    await XpHistory.create({
      userId: user._id,
      amount: -MYSTERY_BOX_COST,
      source: 'mystery_box',
      description: `Opened Mystery Box and got ${selectedReward.name}`,
      levelBefore: user.level,
      levelAfter: user.level
    });

    res.status(200).json({
      success: true,
      data: {
        reward: selectedReward,
        xpBalance: user.xpBalance,
        totalXpEarned: user.totalXpEarned,
        ownedThemes: user.ownedThemes,
        ownedBorders: user.ownedBorders,
        ownedTitles: user.ownedTitles
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Equip item
// @route   POST /api/store/equip
// @access  Private
const equipItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;
    const user = await User.findById(req.user._id);

    let ownedArray = [];
    if (type === 'theme') ownedArray = user.ownedThemes;
    if (type === 'border') ownedArray = user.ownedBorders;
    if (type === 'title') ownedArray = user.ownedTitles;

    if (!ownedArray.includes(itemId) && itemId !== 'default' && itemId !== 'none' && itemId !== 'Newbie') {
      return res.status(400).json({ success: false, message: 'You do not own this item' });
    }

    if (type === 'theme') user.activeTheme = itemId;
    if (type === 'border') user.activeBorder = itemId;
    if (type === 'title') user.activeTitle = itemId;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Equipped successfully',
      data: {
        activeTheme: user.activeTheme,
        activeBorder: user.activeBorder,
        activeTitle: user.activeTitle
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStoreItems, purchaseItem, openMysteryBox, equipItem };
