require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });
    
    // Simulate frontend payload
    const itemId = 'theme_blue'; // cost 5
    const item = require('../config/storeItems').STORE_ITEMS.find(i => i.id === itemId);
    
    console.log("User diamonds:", typeof user.diamonds, user.diamonds);
    console.log("Item cost:", typeof item.cost, item.cost);
    
    if (user.diamonds < item.cost) {
      console.log("Validation: Not enough Diamonds");
    } else {
      console.log("Validation: Passed");
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
