const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const XpHistory = require('../models/XpHistory');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixXpHistoryEnum() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for XP History Fix');

    const streakResult = await XpHistory.updateMany(
      { source: 'streak_bonus' },
      { $set: { source: 'streak' } }
    );

    const badgeResult = await XpHistory.updateMany(
      { source: 'badge_bonus' },
      { $set: { source: 'badge' } }
    );

    console.log(`Updated ${streakResult.modifiedCount} records from 'streak_bonus' to 'streak'.`);
    console.log(`Updated ${badgeResult.modifiedCount} records from 'badge_bonus' to 'badge'.`);

    console.log('Finished fixing mismatched enum values.');
    process.exit(0);
  } catch (error) {
    console.error(' Error fixing XP History:', error);
    process.exit(1);
  }
}

fixXpHistoryEnum();
