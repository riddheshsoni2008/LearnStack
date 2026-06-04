require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });
    user.diamonds = undefined;
    
    // Simulate what happens in the controller
    user.diamonds -= 5;
    
    try {
      await user.save();
      console.log("Saved successfully. user.diamonds is now:", user.diamonds);
    } catch(err) {
      console.log("Validation error:", err.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
