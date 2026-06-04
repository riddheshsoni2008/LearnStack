const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { purchaseItem } = require('../controllers/store.controller');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testStore() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne();
    if (!user) {
      console.log('No user found');
      process.exit(1);
    }
    
    console.log(`User ${user.email} has ${user.xpBalance} XP. Adding 100 XP...`);
    user.xpBalance = 100;
    await user.save();

    const req = {
      user: { _id: user._id },
      body: { itemId: 'theme_blue' }
    };
    const res = {
      status: (code) => {
        console.log('Status:', code);
        return {
          json: (data) => {
            console.log('Response:', data);
          }
        };
      }
    };

    await purchaseItem(req, res);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testStore();
