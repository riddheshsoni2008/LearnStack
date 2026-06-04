require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // 1. Force a user to have missing cosmetic arrays using raw driver
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'riddheshsoni008@gmail.com' },
      { $unset: { ownedThemes: "", ownedBorders: "", ownedTitles: "" } }
    );
    console.log("Raw DB updated. Arrays removed.");
    
    // 2. Fetch with mongoose
    const user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });
    
    console.log("Mongoose user.ownedThemes:", user.ownedThemes);
    console.log("Is array?", Array.isArray(user.ownedThemes));
    
    // 3. Simulate purchase
    let ownedArray = user.ownedThemes;
    console.log("ownedArray before push:", ownedArray);
    
    try {
      ownedArray.push('theme_blue');
      console.log("Push successful!", user.ownedThemes);
    } catch(err) {
      console.log("Push failed:", err.message);
    }
    
    await user.save();
    console.log("Saved.");
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
