const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkXP() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const historyDocs = await ExerciseHistoryDaily.find().sort({ date: -1 }).limit(10).populate('userId', 'email name');
    let history = [];
    historyDocs.forEach(doc => {
      if (doc.xpHistory) {
        doc.xpHistory.forEach(h => {
          history.push({
            user: doc.userId ? doc.userId.email : 'Unknown',
            amount: h.amount,
            source: h.source,
            description: h.description,
            time: h.createdAt
          });
        });
      }
    });

    history.sort((a, b) => b.time - a.time);
    console.log(history.slice(0, 10));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkXP();
