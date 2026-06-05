require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { STORE_ITEMS } = require('../config/storeItems');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    let user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });

    // reset cosmetics for clean test
    user.ownedThemes = [];
    user.ownedBorders = [];
    user.ownedTitles = [];
    user.diamonds = 1000;
    user.activeTheme = 'default';
    user.activeBorder = 'none';
    user.activeTitle = 'Newbie';
    await user.save();

    console.log("---- Testing Purchases ----");
    for (const item of STORE_ITEMS) {
      console.log(`\nPurchasing: ${item.id} (Type: ${item.type})`);

      let ownedArray = [];
      if (item.type === 'theme') ownedArray = user.ownedThemes;
      if (item.type === 'border') ownedArray = user.ownedBorders;
      if (item.type === 'title') ownedArray = user.ownedTitles;

      if (ownedArray.includes(item.id)) {
        console.log(`Failed: Already own ${item.id}`);
        continue;
      }

      if (user.diamonds < item.cost) {
        console.log(`Failed: Not enough diamonds`);
        continue;
      }

      user.diamonds -= item.cost;

      if (item.type === 'theme') user.ownedThemes.push(item.id);
      else if (item.type === 'border') user.ownedBorders.push(item.id);
      else if (item.type === 'title') user.ownedTitles.push(item.id);
      else console.log(`ERROR: Unknown type ${item.type}`);

      console.log(`Success: Purchased ${item.id}`);
    }
    await user.save();

    console.log("\n---- Post Purchase DB State ----");
    console.log("ownedThemes:", user.ownedThemes);
    console.log("ownedBorders:", user.ownedBorders);
    console.log("ownedTitles:", user.ownedTitles);

    console.log("\n---- Testing Equips ----");
    for (const item of STORE_ITEMS) {
      console.log(`\nEquipping: ${item.id} (Type: ${item.type})`);
      let ownedArray = [];
      if (item.type === 'theme') ownedArray = user.ownedThemes;
      if (item.type === 'border') ownedArray = user.ownedBorders;
      if (item.type === 'title') ownedArray = user.ownedTitles;

      if (!ownedArray.includes(item.id)) {
        console.log(`Failed: You do not own ${item.id}`);
        continue;
      }

      if (item.type === 'theme') user.activeTheme = item.id;
      else if (item.type === 'border') user.activeBorder = item.id;
      else if (item.type === 'title') user.activeTitle = item.id;
      else console.log(`ERROR: Unknown type ${item.type}`);

      console.log(`Success: Equipped ${item.id}`);
    }

    await user.save();
    console.log("\n---- Post Equip DB State ----");
    console.log("activeTheme:", user.activeTheme);
    console.log("activeBorder:", user.activeBorder);
    console.log("activeTitle:", user.activeTitle);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
