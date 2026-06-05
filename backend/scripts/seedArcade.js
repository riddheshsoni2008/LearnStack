const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const GameLevel = require('../models/GameLevel');

dotenv.config();

const levels = [
  {
    world: "Lost Variable City",
    levelNumber: 1,
    title: "The Forgotten Name",
    story: "A confused robot wanders the neon streets. It has forgotten its own identity and needs your help to store its name in memory.",
    challengeText: "Declare a variable named `robotName` and assign it the string value 'Robo'.",
    gameType: "CODE_WRITE",
    language: "javascript",
    initialCode: "// Help the robot remember its name\n",
    validationId: "variables_01",
    xpReward: 50,
    difficulty: "BEGINNER",
    isBossLevel: false
  },
  {
    world: "Lost Variable City",
    levelNumber: 6,
    title: "Boss: The Memory Leak Monster",
    story: "A giant blob of uncollected garbage data is blocking the exit!",
    challengeText: "Fix the bug: The variable `health` was declared with `const`, but it needs to be updated.",
    gameType: "BUG_FIX",
    language: "javascript",
    initialCode: "const health = 100;\nhealth = 50; // Fix this!",
    validationId: "variables_boss",
    xpReward: 150,
    difficulty: "BOSS",
    isBossLevel: true
  }
];

// Add World 2 - 5 placeholders for architecture demonstration
const worlds = ["Function Factory", "Conditional Gate", "Loop Dungeon", "Array Kingdom"];
let globalLevelId = 7;

worlds.forEach((worldName, wIdx) => {
  for (let i = 1; i <= 6; i++) {
    levels.push({
      world: worldName,
      levelNumber: i,
      title: i === 6 ? `Boss Battle` : `Level ${i}`,
      story: `Story for ${worldName} - Stage ${i}`,
      challengeText: `Challenge text for ${worldName} - Stage ${i}`,
      gameType: "CODE_WRITE",
      language: "javascript",
      initialCode: "// Your code here",
      validationId: "generic_validation",
      xpReward: i === 6 ? 150 : 50,
      difficulty: i === 6 ? "BOSS" : "BEGINNER",
      isBossLevel: i === 6
    });
    globalLevelId++;
  }
});

const GameAchievement = require('../models/GameAchievement');

const achievements = [
  {
    name: "First Challenge Completed",
    description: "Welcome to the Arcade. You completed your first level.",
    icon: "🏆",
    type: "FIRST_CHALLENGE",
    target: 1
  },
  {
    name: "Variable Explorer",
    description: "Completed 5 Arcade levels.",
    icon: "🧩",
    type: "LEVEL_COMPLETE",
    target: 5
  },
  {
    name: "Function Master",
    description: "Completed 15 Arcade levels.",
    icon: "⚙️",
    type: "LEVEL_COMPLETE",
    target: 15
  },
  {
    name: "Bug Hunter",
    description: "Defeated your first Boss.",
    icon: "🐛",
    type: "BOSS_DEFEATED",
    target: 1
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    await GameLevel.deleteMany();
    await GameAchievement.deleteMany();
    console.log('Cleared existing levels and achievements.');

    await GameLevel.insertMany(levels);
    await GameAchievement.insertMany(achievements);
    console.log('30 Arcade Levels and 4 Achievements Seeded Successfully!');

    // Create generic validator if it doesn't exist
    const validatorDir = path.join(__dirname, '../validators/arcade');
    if (!fs.existsSync(validatorDir)) {
      fs.mkdirSync(validatorDir, { recursive: true });
    }

    const genericValidator = `
module.exports = async function validateCode(context, code) {
  return { passed: true };
};
`;
    fs.writeFileSync(path.join(validatorDir, 'generic_validation.js'), genericValidator);

    // Also variables_boss
    const bossValidator = `
module.exports = async function validateCode(context, code) {
  if (code.includes('const health')) {
    return { passed: false, error: 'You cannot reassign a const variable. Try using let.' };
  }
  if (context.health === 50) return { passed: true };
  return { passed: false, error: 'Health should be 50.' };
};
`;
    fs.writeFileSync(path.join(validatorDir, 'variables_boss.js'), bossValidator);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
