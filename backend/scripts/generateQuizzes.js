const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Import the manual generator dictionary
const { generateQuestionsForLesson } = require('../data/quizDataDictionary');

dotenv.config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const FORCE_REGENERATE = args.includes('--force');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const allLessons = await Lesson.find().sort({ trackId: 1, order: 1 });

    let processedCount = 0;

    const globalQuestionSet = new Set();

    if (!FORCE_REGENERATE) {
      const existingQuizzes = await Quiz.find({}, 'questions.question').lean();
      existingQuizzes.forEach(quiz => {
        quiz.questions.forEach(q => {
          globalQuestionSet.add(q.question.toLowerCase().trim());
        });
      });
      console.log(`Loaded ${globalQuestionSet.size} existing questions for duplicate checking.`);
    } else {
      console.log('Force regenerate enabled. Clearing old quizzes...');
      await Quiz.deleteMany({});
    }

    for (const lesson of allLessons) {
      const existingQuiz = await Quiz.findOne({ lessonId: lesson._id });

      if (existingQuiz && !FORCE_REGENERATE) {
        console.log(`⏭️  Skipping existing quiz for: ${lesson.title}`);
        continue;
      }



      const generatedQuestions = generateQuestionsForLesson(lesson.title, lesson.topic || lesson.language);

      // Validate structure and constraints
      if (!generatedQuestions || generatedQuestions.length !== 5) {
        throw new Error(`CRITICAL: Exactly 5 questions were not generated for ${lesson.title}`);
      }

      // Duplicate prevention scan
      for (const q of generatedQuestions) {
        const normalizedQ = q.question.toLowerCase().trim();
        if (globalQuestionSet.has(normalizedQ)) {
          throw new Error(`CRITICAL DUPLICATE DETECTED: The question "${q.question}" already exists! Zero duplicates allowed.`);
        }
        globalQuestionSet.add(normalizedQ);
      }

      // Save to database
      if (existingQuiz && FORCE_REGENERATE) {
        existingQuiz.questions = generatedQuestions;
        await existingQuiz.save();
      } else {
        await Quiz.create({
          lessonId: lesson._id,
          questions: generatedQuestions
        });
      }

      processedCount++;
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  } catch (err) {
    console.error("Fatal Error:", err);
    process.exit(1);
  }
}

main();
