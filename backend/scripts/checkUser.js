require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({});
    console.log("Users:", users.map(u => ({ email: u.email, diamonds: u.diamonds, xpBalance: u.xpBalance })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
