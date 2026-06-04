const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Track = require('./models/Track');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Badge = require('./models/Badge');
const courseData = require('./data/courseContent');
const { getChallenge } = require('./data/codingChallenges');

dotenv.config();

// ═══════════════════════════════════════════════════════════════
// Achievement Badges — seeded into database
// ═══════════════════════════════════════════════════════════════
const BADGES = [
  // ── Common (easy to earn) ──
  { name: 'First Step', icon: '🎯', description: 'Complete your first lesson', rarity: 'common', condition: 'FIRST_LESSON', conditionValue: '', xpBonus: 25 },
  { name: 'Quiz Whiz', icon: '🧠', description: 'Pass your first quiz', rarity: 'common', condition: 'FIRST_QUIZ', conditionValue: '', xpBonus: 25 },
  { name: 'Streak Starter', icon: '🔥', description: 'Achieve a 3-day learning streak', rarity: 'common', condition: 'STREAK', conditionValue: '3', xpBonus: 30 },
  { name: 'Century Club', icon: '💯', description: 'Earn 100 XP', rarity: 'common', condition: 'XP_MILESTONE', conditionValue: '100', xpBonus: 20 },
  { name: 'High Five', icon: '✋', description: 'Complete 5 lessons', rarity: 'common', condition: 'LESSONS_5', conditionValue: '5', xpBonus: 30 },

  // ── Rare (moderate effort) ──
  { name: 'Streak Master', icon: '⚡', description: 'Maintain a 7-day streak', rarity: 'rare', condition: 'STREAK', conditionValue: '7', xpBonus: 50 },
  { name: 'Perfect Score', icon: '⭐', description: 'Score 100% on any quiz', rarity: 'rare', condition: 'PERFECT_SCORE', conditionValue: '', xpBonus: 30 },
  { name: 'XP Hunter', icon: '💰', description: 'Earn 500 XP', rarity: 'rare', condition: 'XP_MILESTONE', conditionValue: '500', xpBonus: 50 },
  { name: 'Speed Learner', icon: '🚀', description: 'Complete 5 lessons in one day', rarity: 'rare', condition: 'LESSONS_IN_DAY', conditionValue: '5', xpBonus: 40 },

  // ── Epic (track completions) ──
  { name: 'HTML Hero', icon: '🌐', description: 'Complete the HTML & CSS track', rarity: 'epic', condition: 'COMPLETE_TRACK', conditionValue: 'HTML', xpBonus: 100 },
  { name: 'JS Warrior', icon: '⚔️', description: 'Complete the JavaScript track', rarity: 'epic', condition: 'COMPLETE_TRACK', conditionValue: 'JavaScript', xpBonus: 100 },
  { name: 'React Ranger', icon: '⚛️', description: 'Complete the React track', rarity: 'epic', condition: 'COMPLETE_TRACK', conditionValue: 'React', xpBonus: 100 },
  { name: 'Node Knight', icon: '🛡️', description: 'Complete the Node.js track', rarity: 'epic', condition: 'COMPLETE_TRACK', conditionValue: 'Node', xpBonus: 100 },
  { name: 'XP King', icon: '👑', description: 'Earn 1,000 XP', rarity: 'epic', condition: 'XP_MILESTONE', conditionValue: '1000', xpBonus: 100 },
  { name: 'Code Crusher', icon: '💻', description: 'Pass 10 coding challenges', rarity: 'epic', condition: 'CHALLENGES', conditionValue: '10', xpBonus: 50 },
  { name: 'Streak Legend', icon: '💎', description: 'Maintain a 30-day streak', rarity: 'epic', condition: 'STREAK', conditionValue: '30', xpBonus: 200 },

  // ── Legendary (ultimate) ──
  { name: 'Full Stack Hero', icon: '🏆', description: 'Complete all learning tracks', rarity: 'legendary', condition: 'ALL_TRACKS', conditionValue: '', xpBonus: 500 },
  { name: 'XP Legend', icon: '🌟', description: 'Earn 5,000 XP', rarity: 'legendary', condition: 'XP_MILESTONE', conditionValue: '5000', xpBonus: 300 },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (except Users and Progress)
    await Track.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Badge.deleteMany({});
    console.log('🗑️  Cleared old tracks, lessons, quizzes, and badges');

    // ── Seed Badges ──
    console.log('\n🏆 Seeding badges...');
    for (const badge of BADGES) {
      await Badge.create(badge);
      const rarityColors = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };
      console.log(`  ${rarityColors[badge.rarity]} ${badge.icon} ${badge.name} (${badge.rarity})`);
    }
    console.log(`  ✅ ${BADGES.length} badges seeded!\n`);

    // ── Seed Courses ──
    for (let trackInfo of courseData) {
      console.log(`📚 Creating Track: ${trackInfo.title}`);
      
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
        // Quizzes are now generated dynamically via scripts/generateQuizzes.js
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`   📚 ${courseData.length} tracks with 115+ lessons`);
    console.log(`   🏆 ${BADGES.length} achievement badges`);
    console.log(`\n💡 Note: Quizzes are not seeded by default. Run 'node scripts/generateQuizzes.js' to generate them.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
