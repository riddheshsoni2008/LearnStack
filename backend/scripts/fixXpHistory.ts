import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

const XpHistory = mongoose.models.XpHistory || mongoose.model('XpHistory', new mongoose.Schema({}, { strict: false }));

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixXpHistoryEnum() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  
    const streakResult = await XpHistory.updateMany(
      { source: 'streak_bonus' },
      { $set: { source: 'streak' } }
    );

    const badgeResult = await XpHistory.updateMany(
      { source: 'badge_bonus' },
      { $set: { source: 'badge' } }
    );

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

fixXpHistoryEnum();
