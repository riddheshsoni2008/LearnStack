const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Badge = require('../models/Badge');
const { openMysteryBox } = require('../controllers/store.controller');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testMysteryBadge() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne();
    if (!user) {
      console.log('No user found');
      process.exit(1);
    }
    
    // Give user enough XP
    user.xpBalance += 500;
    await user.save();

    console.log(`Testing mystery box for user ${user.email}`);

    // Mock Math.random to always pick the rare badge (index 4)
    // weights: 30, 25, 15, 15, 10
    // total = 95
    // randomNum = 85 to hit the rare badge
    const originalRandom = Math.random;
    Math.random = () => 0.9; 

    const req = {
      user: { _id: user._id },
    };
    const res = {
      status: (code) => {
        return {
          json: (data) => {
            console.log('Mystery Box Response:', JSON.stringify(data, null, 2));
          }
        };
      }
    };

    await openMysteryBox(req, res);
    Math.random = originalRandom; // Restore
    
    const updatedUser = await User.findById(user._id).populate('badges');
    console.log('User Badges:', updatedUser.badges.map(b => b.name));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMysteryBadge();
