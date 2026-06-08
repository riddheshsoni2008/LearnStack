const mongoose = require('mongoose');
const User = require('./models/User');
const Track = require('./models/Track');
const Certificate = require('./models/Certificate');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let out = '';
  
  const totalPublishedTracks = await Track.countDocuments({ isPublished: true });
  out += `Total published tracks: ${totalPublishedTracks}\n`;
  
  const usersWithCerts = await Certificate.distinct('userId', { certificateType: 'TRACK', isValid: true });
  out += `Users with at least one TRACK cert: ${usersWithCerts.length}\n`;
  
  for (const uid of usersWithCerts) {
    const u = await User.findById(uid);
    const count = await Certificate.countDocuments({ userId: uid, certificateType: 'TRACK', isValid: true });
    out += `User ${u ? u.name : uid} has ${count} TRACK certs.\n`;
    
    // Test if evaluate works
    if (u) {
      const { evaluateAdvancedCertifications } = require('./services/certificateService');
      const awards = await evaluateAdvancedCertifications(u._id, u);
      out += `  -> Evaluated manually. New awards: ${awards.map(a => a.certificateType).join(', ')}\n`;
      
      const profCert = await Certificate.findOne({ userId: uid, certificateType: 'PROFESSIONAL' });
      out += `  -> Professional cert exists in DB? ${!!profCert}\n`;
    }
  }

  fs.writeFileSync('db_out3.txt', out);
  mongoose.disconnect();
}

run().catch(err => fs.writeFileSync('db_out3.txt', err.toString()));
