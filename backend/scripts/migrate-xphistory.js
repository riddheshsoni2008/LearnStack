const mongoose = require('mongoose');
const XpHistory = require('../models/XpHistory');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Starting XP History Migration...');

    const xpRecords = await XpHistory.find({}).sort({ createdAt: 1 }).lean();
    console.log(`Found ${xpRecords.length} old XP History records to migrate.`);

    let migrated = 0;

    // Optional: We can clear existing xpHistory arrays to avoid duplicates if running multiple times
    // await ExerciseHistoryDaily.updateMany({}, { $set: { xpHistory: [], totalXpEarnedToday: 0 } });

    for (const record of xpRecords) {
      const dateStr = record.createdAt.toISOString().split('T')[0];
      
      const newEntry = {
        amount: record.amount,
        source: record.source,
        description: record.description,
        referenceId: record.referenceId,
        levelBefore: record.levelBefore,
        levelAfter: record.levelAfter,
        createdAt: record.createdAt
      };

      // Check if this exact record is already migrated (simple duplicate prevention)
      const existingDoc = await ExerciseHistoryDaily.findOne({
        userId: record.userId,
        date: dateStr,
        'xpHistory.createdAt': record.createdAt,
        'xpHistory.amount': record.amount,
        'xpHistory.description': record.description
      });

      if (!existingDoc) {
        await ExerciseHistoryDaily.updateOne(
          { userId: record.userId, date: dateStr },
          {
            $setOnInsert: { userId: record.userId, date: dateStr },
            $push: { xpHistory: newEntry },
            $inc: { totalXpEarnedToday: record.amount }
          },
          { upsert: true }
        );
        migrated++;
      }
    }

    console.log(`Migration Complete. Migrated ${migrated} records.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

run();
