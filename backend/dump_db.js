const mongoose = require('mongoose');
const User = require('./models/User');
const Track = require('./models/Track');
const Certificate = require('./models/Certificate');
const Lesson = require('./models/Lesson');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let out = '';
  
  const totalPublishedTracks = await Track.countDocuments({ isPublished: true });
  out += `Total published tracks: ${totalPublishedTracks}\n`;
  
  const users = await User.find().limit(1);
  if (users.length === 0) {
    out += 'No users found\n';
    fs.writeFileSync('db_out.txt', out);
    return;
  }
  const user = users[0];
  out += `User: ${user.name}\n`;
  
  const earnedTracksCount = await Certificate.countDocuments({ userId: user._id, certificateType: 'TRACK', isValid: true });
  out += `Earned Tracks Count for user: ${earnedTracksCount}\n`;
  
  const allTracks = await Track.find({ isPublished: true });
  for (const track of allTracks) {
    const cert = await Certificate.findOne({ userId: user._id, trackId: track._id, certificateType: 'TRACK' });
    const lessons = await Lesson.countDocuments({ trackId: track._id, isPublished: true });
    out += `Track ${track.title} (${track._id}): Cert exists? ${!!cert}. Lessons count: ${lessons}\n`;
  }

  fs.writeFileSync('db_out.txt', out);
  mongoose.disconnect();
}

run().catch(err => {
    fs.writeFileSync('db_out.txt', err.toString());
});
