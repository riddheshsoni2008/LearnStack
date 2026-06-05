const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GameLevel = require('../models/GameLevel');

dotenv.config();

const testSubmit = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the very first level
    const level = await GameLevel.findOne({ levelNumber: 1 });
    console.log("Found level ID:", level._id.toString());
    
    const query = await GameLevel.findById(level._id.toString());
    if (query) {
      console.log("findById worked!");
    } else {
      console.log("findById failed!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testSubmit();
