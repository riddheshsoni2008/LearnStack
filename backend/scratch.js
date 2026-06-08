const mongoose = require('mongoose');
const User = require('./models/User');
const Track = require('./models/Track');
const Certificate = require('./models/Certificate');
const { checkAndAwardCertificate, evaluateAdvancedCertifications } = require('./services/certificateService');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const totalPublishedTracks = await Track.countDocuments({ isPublished: true });
  console.log('Total published tracks:', totalPublishedTracks);
  
  const users = await User.find().limit(1);
  if (users.length === 0) return console.log('No users found');
  const user = users[0];
  console.log('User:', user.name);
  
  const earnedTracksCount = await Certificate.countDocuments({ userId: user._id, certificateType: 'TRACK', isValid: true });
  console.log('Earned Tracks Count for user:', earnedTracksCount);
  
  const allTracks = await Track.find({ isPublished: true });
  for (const track of allTracks) {
    const cert = await Certificate.findOne({ userId: user._id, trackId: track._id, certificateType: 'TRACK' });
    console.log(`Track ${track.title} (${track._id}): Cert exists?`, !!cert);
    if (!cert) {
      console.log('Triggering checkAndAwardCertificate for this track...');
      const res = await checkAndAwardCertificate(user._id, track._id);
      console.log('Result of checkAndAwardCertificate:', res ? res.certificateId : 'null');
    }
  }

  console.log('Evaluating advanced certifications manually...');
  const awards = await evaluateAdvancedCertifications(user._id, user);
  console.log('Advanced awards:', awards.map(a => a.certificateType));

  mongoose.disconnect();
}

run().catch(console.error);
