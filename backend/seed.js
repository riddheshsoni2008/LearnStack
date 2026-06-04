const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Track = require('./models/Track');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const courseData = require('./data/courseContent');
const { interviewQuestions, getFallbackQuestions } = require('./data/interviewQuestions');
const { getChallenge } = require('./data/codingChallenges');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Track.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️  Cleared old data');

    for (let trackInfo of courseData) {
      console.log(`Creating Track: ${trackInfo.title}`);
      
      const track = await Track.create({
        title: trackInfo.title,
        description: trackInfo.description,
        thumbnail: '',
        level: trackInfo.level,
        totalWeeks: trackInfo.totalWeeks,
        totalLessons: trackInfo.lessons.length, 
        order: trackInfo.order,
        tags: trackInfo.tags,
        isPublished: true
      });

      console.log(`  -> Generating ${trackInfo.lessons.length} lessons...`);
      
      // Generate Lessons
      let orderCounter = 1;
      for (let lessonInfo of trackInfo.lessons) {
        // Create realistic placeholder content based on the title
        const content = `Welcome to this comprehensive lesson on **${lessonInfo.title}**!\n\nThis is a fundamental pillar of mastering ${trackInfo.title}. In the embedded video above, you will learn the exact step-by-step process of implementing ${lessonInfo.topic} concepts correctly.\n\n### What You Will Learn\n- Core principles of ${lessonInfo.title}\n- Real-world use cases for ${lessonInfo.topic}\n- Common mistakes to avoid\n\nMake sure to watch the full video before attempting the quiz!`;
        
        const codeSnippet = `// Example for: ${lessonInfo.title}\nconsole.log("Mastering ${lessonInfo.topic} -> ${lessonInfo.title}!");`;

        // Get a coding challenge for this lesson's topic
        const challenge = getChallenge(lessonInfo.topic);

        const lesson = await Lesson.create({
          trackId: track._id,
          weekNumber: lessonInfo.weekNumber,
          title: lessonInfo.title,
          description: `A comprehensive guide and video tutorial on ${lessonInfo.title}.`,
          videoUrl: lessonInfo.videoUrl || 'dQw4w9WgXcQ',
          content: content,
          codeSnippet: codeSnippet,
          language: lessonInfo.topic,
          xpReward: 10 + (lessonInfo.weekNumber * 5),
          order: orderCounter++,
          challenge: `Implement a basic example of ${lessonInfo.title} using the concepts learned.`,
          codingChallenge: challenge,
          isPublished: true
        });

        // Get interview questions for this topic
        const topicQuestions = interviewQuestions[lessonInfo.topic] || getFallbackQuestions(lessonInfo.title);
        
        // Shuffle and pick 2 questions
        const shuffled = [...topicQuestions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 2);

        // Generate a Quiz for each lesson
        await Quiz.create({
          lessonId: lesson._id,
          questions: selectedQuestions
        });
      }
    }

    console.log('✅ Seed completed successfully with 115+ lessons and quizzes!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
