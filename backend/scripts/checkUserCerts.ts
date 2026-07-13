import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Certificate from '../models/Certificate';
import User from '../models/User';
import Track from '../models/Track';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findOne({ name: 'riddhesh soni' });
  if (!u) {
    console.log('User not found');
    return process.exit(0);
  }
  
  const certs = await Certificate.find({ userId: u._id }).populate('trackId', 'title');
  console.log(`User ${u.name} has ${certs.length} certificates:`);
  certs.forEach(c => {
    if (c.certificateType === 'TRACK') {
      console.log(`- TRACK: ${c.trackId ? (c.trackId as any).title : 'Unknown Track'}`);
    } else {
      console.log(`- ${c.certificateType}`);
    }
  });

  mongoose.disconnect();
}
check();
