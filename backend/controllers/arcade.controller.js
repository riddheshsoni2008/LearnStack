const vm = require('vm');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const GameLevel = require('../models/GameLevel');
const GameAchievement = require('../models/GameAchievement');

// @desc    Get Arcade Hub Data
// @route   GET /api/arcade/hub
// @access  Private
const getArcadeHub = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalXpEarned gameXpEarned arcadeProgress unlockedGameAchievements completedBossBattles dailyChallenge');

    if (user.totalXpEarned < 1000) {
      return res.status(403).json({ success: false, message: 'Arcade locked. Reach 1000 XP to unlock.' });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const lastCompleted = user.dailyChallenge?.lastCompletedDate ? new Date(user.dailyChallenge.lastCompletedDate).setHours(0, 0, 0, 0) : null;

    // Static Worlds for V1 (ids match world names in db)
    const worlds = [
      { id: 'Lost Variable City', name: 'Lost Variable City', description: 'Master variables to restore the city.', levelsCount: 6, order: 1 },
      { id: 'Function Factory', name: 'Function Factory', description: 'Fix the factory machines with functions.', levelsCount: 6, order: 2 },
      { id: 'Conditional Gate', name: 'Conditional Gate', description: 'Unlock the magic gates using logic.', levelsCount: 6, order: 3 },
      { id: 'Loop Dungeon', name: 'Loop Dungeon', description: 'Defeat endless enemies with loops.', levelsCount: 6, order: 4 },
      { id: 'Array Kingdom', name: 'Array Kingdom', description: 'Organize the royal treasures.', levelsCount: 6, order: 5 }
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          gameXp: user.gameXpEarned || 0,
          completedLevels: user.arcadeProgress?.length || 0,
          completedBosses: user.completedBossBattles || 0,
          achievements: user.unlockedGameAchievements?.length || 0,
          level: user.level,
          levelTitle: user.levelTitle
        },
        worlds: worlds,
        dailyChallenge: {
          available: lastCompleted !== today,
          reward: 100,
          streak: user.dailyChallenge?.currentStreak || 0
        },
        topPlayers: await User.find({ gameXpEarned: { $gt: 0 } }).select('name level').sort({ gameXpEarned: -1 }).limit(3)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Levels by World
// @route   GET /api/arcade/worlds/:worldId
// @access  Private
const getLevelsByWorld = async (req, res) => {
  try {
    const levels = await GameLevel.find({ world: req.params.worldId }).sort({ levelNumber: 1 });
    res.status(200).json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Level by ID
// @route   GET /api/arcade/levels/:levelId
// @access  Private
const getLevelById = async (req, res) => {
  try {
    const level = await GameLevel.findById(req.params.levelId);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    res.status(200).json({ success: true, data: level });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Arcade Challenge
// @route   POST /api/arcade/submit
// @access  Private
const submitChallenge = async (req, res) => {
  try {
    const { levelId, code } = req.body;
    console.log(`[Arcade] Received submission for levelId: ${levelId}`);
    
    const user = await User.findById(req.user._id);
    const level = await GameLevel.findById(levelId);

    if (!level) {
      console.log(`[Arcade Error] Level not found in DB for id: ${levelId}`);
      return res.status(404).json({ success: false, message: 'Level not found. The level ID provided does not exist in the database.' });
    }
    
    console.log(`[Arcade] Fetched Level: ${level.title} | Validator: ${level.validationId}`);

    // Load validation script
    const validatorPath = path.join(__dirname, '../validators/arcade', `${level.validationId}.js`);
    if (!fs.existsSync(validatorPath)) {
      return res.status(500).json({ success: false, message: 'Validation script missing' });
    }

    const validateCode = require(validatorPath);

    // Sandbox Environment
    const logs = [];
    const context = {
      console: {
        log: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push(`[Error] ${args.join(' ')}`)
      }
    };
    vm.createContext(context);

    try {
      // Execute user code with timeout protection against infinite loops
      vm.runInContext(code, context, { timeout: 1000 });

      // Run specific validation logic, passing level and logs
      const result = await validateCode(context, code, level, logs);

      if (!result.passed) {
        return res.status(400).json({
          success: false,
          passed: false,
          message: result.error || 'Challenge failed. Check your logic.',
          logs
        });
      }

      // Check if already completed
      const alreadyCompleted = user.arcadeProgress.find(p => p.levelId.toString() === levelId);

      let newlyUnlockedAchievements = [];
      if (!alreadyCompleted) {
        user.arcadeProgress.push({ levelId, score: level.xpReward });
        user.gameXpEarned += level.xpReward;
        user.totalXpEarned += level.xpReward;
        if (level.isBossLevel) {
          user.completedBossBattles += 1;
        }

        // Check for newly unlocked achievements
        const allAchievements = await GameAchievement.find({});
        for (let achievement of allAchievements) {
          if (!user.unlockedGameAchievements.includes(achievement._id)) {
            let conditionMet = false;
            if (achievement.type === 'LEVEL_COMPLETE' && user.arcadeProgress.length >= achievement.target) {
              conditionMet = true;
            } else if (achievement.type === 'FIRST_CHALLENGE' && user.arcadeProgress.length >= 1) {
              conditionMet = true;
            } else if (achievement.type === 'BOSS_DEFEATED' && user.completedBossBattles >= achievement.target) {
              conditionMet = true;
            }

            if (conditionMet) {
              user.unlockedGameAchievements.push(achievement._id);
              newlyUnlockedAchievements.push(achievement);
            }
          }
        }

        await user.save();
      }

      // Find next level ID
      let nextLevelId = null;
      const nextLevel = await GameLevel.findOne({ world: level.world, levelNumber: level.levelNumber + 1 });
      if (nextLevel) {
        nextLevelId = nextLevel._id;
      }

      return res.status(200).json({
        success: true,
        passed: true,
        message: 'Level Cleared! 🏆',
        xpAwarded: alreadyCompleted ? 0 : level.xpReward,
        newAchievements: newlyUnlockedAchievements,
        nextLevelId,
        logs
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        passed: false,
        message: err.message === 'Script execution timed out.' ? 'Execution Timeout: Infinite loop detected.' : err.message,
        logs
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getArcadeLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'global' } = req.query;
    
    let formattedLeaderboard = [];

    if (timeframe === 'global') {
      const topUsers = await User.find({ gameXpEarned: { $gt: 0 } })
        .select('name gameXpEarned arcadeProgress completedBossBattles level levelTitle')
        .sort({ gameXpEarned: -1, 'arcadeProgress.length': -1, completedBossBattles: -1 })
        .limit(50);

      formattedLeaderboard = topUsers.map((u, index) => ({
        rank: index + 1,
        id: u._id,
        name: u.name,
        level: u.level,
        levelTitle: u.levelTitle,
        gameXp: u.gameXpEarned,
        completedLevels: u.arcadeProgress?.length || 0,
        bossesDefeated: u.completedBossBattles || 0
      }));
    } else {
      const days = timeframe === 'weekly' ? 7 : 30;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const topUsers = await User.aggregate([
        { $match: { gameXpEarned: { $gt: 0 } } },
        { 
          $project: {
            name: 1,
            level: 1,
            levelTitle: 1,
            completedBossBattles: 1,
            filteredProgress: {
              $filter: {
                input: "$arcadeProgress",
                as: "progress",
                cond: { $gte: ["$$progress.completedAt", sinceDate] }
              }
            }
          }
        },
        { 
          $project: {
            name: 1,
            level: 1,
            levelTitle: 1,
            completedBossBattles: 1,
            gameXp: { $sum: "$filteredProgress.score" },
            completedLevels: { $size: "$filteredProgress" }
          }
        },
        { $match: { gameXp: { $gt: 0 } } },
        { $sort: { gameXp: -1, completedLevels: -1 } },
        { $limit: 50 }
      ]);

      formattedLeaderboard = topUsers.map((u, index) => ({
        rank: index + 1,
        id: u._id,
        name: u.name,
        level: u.level,
        levelTitle: u.levelTitle,
        gameXp: u.gameXp,
        completedLevels: u.completedLevels,
        bossesDefeated: u.completedBossBattles
      }));
    }

    res.status(200).json({
      success: true,
      timeframe,
      data: formattedLeaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Daily Mission
// @route   GET /api/arcade/daily
// @access  Private
const getDailyMission = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date().setHours(0, 0, 0, 0);
    const lastCompleted = user.dailyChallenge?.lastCompletedDate ? new Date(user.dailyChallenge.lastCompletedDate).setHours(0, 0, 0, 0) : null;
    const isCompletedToday = lastCompleted === today;

    // Pick a level based on the current day of the year (so it's the same for everyone that day)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const allLevels = await GameLevel.find({ isBossLevel: false });
    
    if (allLevels.length === 0) {
      return res.status(404).json({ success: false, message: 'No levels available for daily mission.' });
    }

    const dailyLevel = allLevels[dayOfYear % allLevels.length];

    res.status(200).json({
      success: true,
      data: {
        level: dailyLevel,
        isCompletedToday,
        currentStreak: user.dailyChallenge?.currentStreak || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Daily Mission
// @route   POST /api/arcade/daily/submit
// @access  Private
const submitDailyMission = async (req, res) => {
  try {
    const { levelId, code } = req.body;
    console.log(`[Daily Mission] Received submission for levelId: ${levelId}`);
    
    const user = await User.findById(req.user._id);
    const level = await GameLevel.findById(levelId);

    if (!level) {
      console.log(`[Daily Mission Error] Level not found in DB for id: ${levelId}`);
      return res.status(404).json({ success: false, message: 'Level not found. The daily mission level does not exist.' });
    }
    
    console.log(`[Daily Mission] Fetched Level: ${level.title} | Validator: ${level.validationId}`);

    const validatorPath = path.join(__dirname, '../validators/arcade', `${level.validationId}.js`);
    if (!fs.existsSync(validatorPath)) {
      return res.status(500).json({ success: false, message: 'Validation script missing' });
    }

    const validateCode = require(validatorPath);
    
    const logs = [];
    const context = {
      console: {
        log: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push(`[Error] ${args.join(' ')}`)
      }
    };
    vm.createContext(context);

    try {
      vm.runInContext(code, context, { timeout: 1000 });
      // Run specific validation logic, passing level and logs
      const result = await validateCode(context, code, level, logs);
      
      if (!result.passed) {
        return res.status(400).json({ success: false, passed: false, message: result.error || 'Challenge failed.', logs });
      }

      // Daily Challenge Logic
      const today = new Date().setHours(0, 0, 0, 0);
      const lastCompleted = user.dailyChallenge?.lastCompletedDate ? new Date(user.dailyChallenge.lastCompletedDate).setHours(0, 0, 0, 0) : null;
      
      let xpAwarded = 0;
      let streakUpdated = false;

      if (lastCompleted !== today) {
        // Award extra XP for daily (e.g. 100)
        xpAwarded = 100;
        user.gameXpEarned += xpAwarded;
        user.totalXpEarned += xpAwarded;

        // Update streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (!user.dailyChallenge) {
          user.dailyChallenge = { currentStreak: 1, lastCompletedDate: new Date() };
        } else if (lastCompleted === yesterday.getTime()) {
          user.dailyChallenge.currentStreak += 1;
          user.dailyChallenge.lastCompletedDate = new Date();
        } else {
          user.dailyChallenge.currentStreak = 1;
          user.dailyChallenge.lastCompletedDate = new Date();
        }
        
        streakUpdated = true;
        await user.save();
      }

      return res.status(200).json({
        success: true,
        passed: true,
        message: 'Daily Mission Cleared! 🏆',
        xpAwarded,
        streakUpdated,
        newStreak: user.dailyChallenge?.currentStreak,
        logs
      });

    } catch (err) {
      return res.status(400).json({ success: false, passed: false, message: err.message, logs });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getArcadeHub,
  getLevelsByWorld,
  getLevelById,
  submitChallenge,
  getArcadeLeaderboard,
  getDailyMission,
  submitDailyMission
};
