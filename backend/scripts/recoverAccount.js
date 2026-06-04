require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    let user = await User.findOne({ email: 'riddheshsoni008@gmail.com' });

    if (!user) {
      console.log("User not found.");
      process.exit(1);
    }

    console.log("---- Account Recovery ----");
    console.log(`Current Diamonds: ${user.diamonds}`);

    // Restore the balance to what the user reported before the incident (10 Diamonds)
    user.diamonds = 10;

    // Restore some basic cosmetics as an apology for the wipe
    if (!user.ownedThemes.includes('theme_blue')) user.ownedThemes.push('theme_blue');
    if (!user.ownedBorders.includes('border_gold')) user.ownedBorders.push('border_gold');
    if (!user.ownedTitles.includes('title_warrior')) user.ownedTitles.push('title_warrior');

    // Ensure active cosmetics are valid
    if (user.activeTheme === 'theme_galaxy') user.activeTheme = 'theme_blue'; // Galaxy was an expensive item I gave in the test
    if (user.activeBorder === 'border_fire') user.activeBorder = 'border_gold';
    if (user.activeTitle === 'title_ninja') user.activeTitle = 'title_warrior';

    await user.save();

    console.log("Account successfully recovered.");
    console.log(`Restored Diamonds: ${user.diamonds}`);
    console.log(`Restored Themes:`, user.ownedThemes);
    console.log(`Restored Borders:`, user.ownedBorders);
    console.log(`Restored Titles:`, user.ownedTitles);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
