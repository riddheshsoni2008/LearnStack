const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Certificate = require('../models/Certificate');

dotenv.config();

async function fixIndex() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await Certificate.collection.dropIndex('userId_1_trackId_1');
    console.log('Old index dropped successfully.');
  } catch (err) {
    console.log('Error dropping index (maybe it does not exist):', err.message);
  }

  // Ensure new indexes are built
  await Certificate.syncIndexes();
  console.log('Indexes synced.');
  
  mongoose.disconnect();
}
fixIndex();
