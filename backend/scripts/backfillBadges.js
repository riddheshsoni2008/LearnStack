const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const User = require('../models/User');
const Progress = require('../models/Progress');
const Track = require('../models/Track');
const Badge = require('../models/Badge');
const XpHistory = require('../models/XpHistory');


const { checkAndAwardBadges } = require('../services/badgeService');

const runBackfill = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({});


    let totalUsersScanned = 0;
    let totalBadgesAwarded = 0;
    let totalUsersUpdated = 0;

    for (const user of users) {
      totalUsersScanned++;

      const newlyEarnedBadges = await checkAndAwardBadges(user._id);

      if (newlyEarnedBadges && newlyEarnedBadges.length > 0) {
        totalBadgesAwarded += newlyEarnedBadges.length;
        totalUsersUpdated++;

      }
    }

  } finally {

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
};

runBackfill();
