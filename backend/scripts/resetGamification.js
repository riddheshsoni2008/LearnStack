const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const XpHistory = require('../models/XpHistory');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function resetGamification() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for Gamification Reset');

    // 1. Reset all users
    const userResult = await User.updateMany(
      {},
      {
        $set: {
          totalXpEarned: 0,
          xpBalance: 0,
          streak: 0,
          longestStreak: 0,
          completedChallenges: 0,
          perfectQuizzes: 0,
          badges: [],
          ownedThemes: [],
          ownedBorders: [],
          ownedTitles: [],
          activeTheme: 'default',
          activeBorder: 'none',
          activeTitle: 'Newbie'
        }
      }
    );

    // 2. Remove all XP history records
    const xpHistoryResult = await XpHistory.deleteMany({});

    // 3. Remove all ExerciseHistoryDaily records (resets daily lessons and streaks)
    const progressResult = await ExerciseHistoryDaily.deleteMany({});

  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

resetGamification();
