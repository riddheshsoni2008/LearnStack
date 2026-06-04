require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { STORE_ITEMS } = require('../config/storeItems');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });
    
    const itemId = 'title_warrior';
    const type = 'title';
    
    let ownedArray = [];
    if (type === 'theme') ownedArray = user.ownedThemes;
    if (type === 'border') ownedArray = user.ownedBorders;
    if (type === 'title') ownedArray = user.ownedTitles;

    if (!ownedArray.includes(itemId) && itemId !== 'default' && itemId !== 'none' && itemId !== 'Newbie') {
      console.log('You do not own this item');
      process.exit(1);
    }

    if (type === 'theme') user.activeTheme = itemId;
    if (type === 'border') user.activeBorder = itemId;
    if (type === 'title') user.activeTitle = itemId;

    await user.save();
    console.log("Success! Equipped.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
