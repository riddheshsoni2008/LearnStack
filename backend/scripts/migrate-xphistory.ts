import mongoose from 'mongoose';
const XpHistory = mongoose.models.XpHistory || mongoose.model('XpHistory', new mongoose.Schema({}, { strict: false }));
import ExerciseHistoryDaily from '../models/ExerciseHistoryDaily';
import dotenv from 'dotenv';

dotenv.config();

async function run() {

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Starting XP History Migration...');

    const xpRecords = await (XpHistory as any).find({}).sort({ createdAt: 1 }).lean();
    console.log(`Found ${xpRecords.length} old XP History records to migrate.`);

    let migrated = 0;

    for (const record of xpRecords) {
      const dateStr = record.createdAt.toISOString().split('T')[0];

      const newEntry: any = {
        amount: record.amount,
        source: record.source,
        description: record.description,
        referenceId: record.referenceId,
        levelBefore: record.levelBefore,
        levelAfter: record.levelAfter,
        createdAt: record.createdAt
      };

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

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

run();
