const mongoose = require('mongoose');
const User = require('./models/User');
const Track = require('./models/Track');
const ExerciseHistoryDaily = require('./models/ExerciseHistoryDaily');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let out = '';
  
  const users = await User.find().limit(1);
  const user = users[0];
  
  const history = await ExerciseHistoryDaily.find({ userId: user._id });
  
  const trackCount = {};
  const titles = new Set();
  let quizCount = 0;
  
  history.forEach(day => {
    day.completedExercises.forEach(ex => {
      titles.add(ex.title);
      if (ex.title.includes(' - Quiz')) quizCount++;
      if (ex.trackId) {
        trackCount[ex.trackId] = (trackCount[ex.trackId] || 0) + 1;
      }
    });
  });
  
  out += `Total history days: ${history.length}\n`;
  out += `Total quizzes found by title: ${quizCount}\n`;
  out += `Tracks history count:\n`;
  for (const [t, c] of Object.entries(trackCount)) {
    out += `  ${t}: ${c}\n`;
  }
  
  out += `\nSample titles:\n`;
  Array.from(titles).slice(0, 20).forEach(t => out += `  ${t}\n`);

  fs.writeFileSync('db_out_hist.txt', out);
  mongoose.disconnect();
}

run().catch(err => fs.writeFileSync('db_out_hist.txt', err.toString()));
