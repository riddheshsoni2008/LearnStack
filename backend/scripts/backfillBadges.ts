import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
import User from '../models/User';
import Track from '../models/Track';
import Badge from '../models/Badge';


import { checkAndAwardBadges  } from '../services/badgeService';

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
