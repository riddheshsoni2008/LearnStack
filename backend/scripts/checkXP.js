const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const XpHistory = require('../models/XpHistory');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkXP() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const history = await XpHistory.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'email name');
    console.log(history.map(h => ({
      user: h.userId ? h.userId.email : 'Unknown',
      amount: h.amount,
      source: h.source,
      description: h.description,
      time: h.createdAt
    })));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkXP();
