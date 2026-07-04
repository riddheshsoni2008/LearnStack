const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://riddheshsoni:RIDDHESHSONI123@riddheshsoni.smlgcdg.mongodb.net/learnstack?retryWrites=true&w=majority&appName=Riddheshsoni";

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas!");

    const User = require('../models/User');

    const user = await User.findOne({ email: "hariom@gmail.com" });
    if (!user) {
      console.log("User not found!");
      return;
    }

    user.password = "password123";
    await user.save();
    console.log("Successfully updated password for hariom@gmail.com to: password123");

  } catch (err) {
    console.error("Error updating password:", err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
