require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });
    user.diamonds = 85;
    await user.save();
    console.log("Set user diamonds to 85.");
    
    // Simulate what the controller does
    const itemId = 'theme_blue'; // cost 5
    const item = require('../config/storeItems').STORE_ITEMS.find(i => i.id === itemId);
    
    if (user.diamonds < item.cost) {
      console.log("Validation: Not enough Diamonds");
    } else {
      console.log("Validation: Passed");
      user.diamonds -= item.cost;
      console.log("New diamonds:", user.diamonds);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
