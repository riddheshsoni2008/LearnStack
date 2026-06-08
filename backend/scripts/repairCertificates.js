const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Track = require('../models/Track');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const { checkAndAwardCertificate, evaluateAdvancedCertifications } = require('../services/certificateService');

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Starting Certificate Repair...\n');

    const users = await User.find({});
    console.log(`Found ${users.length} users to scan.`);

    const allQuizzes = await Quiz.find({}).lean();
    const quizMap = {}; // lessonId -> quiz
    allQuizzes.forEach(q => quizMap[q.lessonId.toString()] = q);

    const allTracks = await Track.find({ isPublished: true });

    let totalRepairedQuizzes = 0;

    for (const user of users) {
      console.log(`\nScanning User: ${user.name} (${user._id})`);
      
      const historyDocs = await ExerciseHistoryDaily.find({ userId: user._id });
      
      const completedLessons = [];
      const completedQuizzes = new Set();
      let dayDocMap = {};

      // Analyze existing history
      historyDocs.forEach(day => {
        dayDocMap[day.date] = day;
        day.completedExercises.forEach(ex => {
          if (ex.exerciseType === 'Lesson') {
            const exIdStr = ex.exerciseId.toString();
            if (ex.title.includes(' - Quiz')) {
              completedQuizzes.add(exIdStr);
            } else {
              completedLessons.push({ exIdStr, date: day.date, trackId: ex.trackId, title: ex.title });
            }
          }
        });
      });

      let userRepairedQuizzes = 0;

      // Check for missing quizzes
      for (const lessonData of completedLessons) {
        if (quizMap[lessonData.exIdStr] && !completedQuizzes.has(lessonData.exIdStr)) {
          // This lesson has a quiz, but the quiz was not found in the history!
          // We will synthesize a quiz completion on the same day the lesson was completed.
          const dayDoc = dayDocMap[lessonData.date];
          
          if (dayDoc) {
            await ExerciseHistoryDaily.updateOne(
              { _id: dayDoc._id },
              {
                $push: {
                  completedExercises: {
                    exerciseId: lessonData.exIdStr,
                    exerciseType: 'Lesson',
                    trackId: lessonData.trackId,
                    title: `${lessonData.title} - Quiz`,
                    completedAt: new Date(), // Using current date for completion mark to be safe, though date field is old
                    score: 100 // Assume perfect score for retroactive repair
                  }
                }
              }
            );
            userRepairedQuizzes++;
            totalRepairedQuizzes++;
            console.log(`  [REPAIRED] Missing quiz added for lesson: ${lessonData.title}`);
          }
        }
      }

      if (userRepairedQuizzes > 0) {
        console.log(`  -> Synthesized ${userRepairedQuizzes} missing quiz completions.`);
      }

      // Now evaluate all track certificates
      let newTrackCerts = 0;
      for (const track of allTracks) {
        const result = await checkAndAwardCertificate(user._id, track._id);
        if (result && result.createdAt.getTime() === result.updatedAt.getTime()) {
           newTrackCerts++;
        }
      }

      if (newTrackCerts > 0) {
        console.log(`  -> Awarded ${newTrackCerts} new TRACK certificates.`);
      }

      // Finally, evaluate advanced/professional certificates
      const advAwards = await evaluateAdvancedCertifications(user._id, user);
      if (advAwards.length > 0) {
        console.log(`  -> Awarded ${advAwards.length} ADVANCED/PROFESSIONAL certificates! (${advAwards.map(a => a.certificateType).join(', ')})`);
      }
    }

    console.log(`\nRepair Complete. Total missing quizzes synthesized: ${totalRepairedQuizzes}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

run();
