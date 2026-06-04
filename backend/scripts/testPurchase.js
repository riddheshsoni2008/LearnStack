const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { STORE_ITEMS } = require('../config/storeItems');
const { purchaseItem } = require('../controllers/store.controller');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testPurchase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne();
    if (!user) process.exit(1);

    // Ensure enough XP
    user.xpBalance = 100;
    await user.save({ validateBeforeSave: false });

    const req = {
      user: { _id: user._id },
      body: { itemId: 'theme_galaxy' }
    };

    const res = {
      status: (code) => {
        return {
          json: (data) => {
            console.log(`Status ${code}:`, data);
          }
        }
      }
    };

    await purchaseItem(req, res);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testPurchase();
