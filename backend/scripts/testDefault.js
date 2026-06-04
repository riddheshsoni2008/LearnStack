require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // Force a user to have undefined diamonds via native driver
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'riddheshsoni008@gmail.com' },
      { $unset: { diamonds: "" } }
    );
    
    // Now fetch with mongoose
    const user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });
    console.log("Mongoose loaded diamonds as:", user.diamonds);
    
    // Now try to add
    user.diamonds += 10;
    console.log("After adding 10:", user.diamonds);
    
    await user.save();
    console.log("Saved successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
