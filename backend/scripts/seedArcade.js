const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const GameLevel = require('../models/GameLevel');
const GameAchievement = require('../models/GameAchievement');

dotenv.config();

const worldsData = [
  {
    name: "Lost Variable City",
    topic: "Variables",
    scenarios: [
      { t: "The Forgotten Name", s: "A robot forgot its name.", c: "Declare a variable named `robotName` and assign it 'Robo'. Then console.log it.", e: "Robo", start: "let robotName;\n\nconsole.log(robotName);" },
      { t: "Power Core Level", s: "The city's power core is low.", c: "Set `power` to 100. console.log it.", e: "100", start: "let power = 0;\n\nconsole.log(power);" },
      { t: "Neon Signs", s: "The neon signs are broken.", c: "Create a string variable `signText` with value 'Open'. console.log it.", e: "Open", start: "// Fix the sign\n\nconsole.log(signText);" },
      { t: "Traffic Lights", s: "The traffic lights are stuck on red.", c: "Change `light` from 'red' to 'green'. console.log it.", e: "green", start: "let light = 'red';\n\nconsole.log(light);" },
      { t: "City Population", s: "The census needs updating.", c: "Increase `population` by 1. console.log it.", e: "501", start: "let population = 500;\n\nconsole.log(population);" }
    ],
    boss: { t: "The Memory Leak Monster", s: "A giant blob of uncollected garbage data is blocking the exit!", c: "Fix the bug: The variable `health` was declared with `const`, but it needs to be updated. console.log it when it's 50.", e: "50", start: "const health = 100;\nhealth = 50;\nconsole.log(health);" }
  },
  {
    name: "Function Factory",
    topic: "Functions",
    scenarios: [
      { t: "Restart the Belt", s: "The conveyor belts stopped.", c: "Write a function `startBelt(id)` that returns 'Belt ' + id + ' started'. console.log(startBelt(5)).", e: "Belt 5 started", start: "function startBelt(id) {\n  \n}\nconsole.log(startBelt(5));" },
      { t: "Machine Status", s: "Check if the machine is online.", c: "Return true from `isOnline()`. console.log(isOnline()).", e: "true", start: "function isOnline() {\n  \n}\nconsole.log(isOnline());" },
      { t: "Product Count", s: "Count the boxes.", c: "Write `addBoxes(a, b)` that returns a + b. console.log(addBoxes(10, 5)).", e: "15", start: "function addBoxes(a, b) {\n  \n}\nconsole.log(addBoxes(10, 5));" },
      { t: "Quality Control", s: "Inspect the items.", c: "Return 'Pass' from `inspect()`. console.log(inspect()).", e: "Pass", start: "function inspect() {\n  \n}\nconsole.log(inspect());" },
      { t: "Packaging", s: "Box the items.", c: "Return `item + ' in box'` from `pack(item)`. console.log(pack('Toy')).", e: "Toy in box", start: "function pack(item) {\n  \n}\nconsole.log(pack('Toy'));" }
    ],
    boss: { t: "The Infinite Recursion Bot", s: "A rogue bot is looping infinitely!", c: "Return 'Stop' from `halt()`. console.log(halt()).", e: "Stop", start: "function halt() {\n  \n}\nconsole.log(halt());" }
  },
  {
    name: "Conditional Gate",
    topic: "Conditionals",
    scenarios: [
      { t: "The Magical Gate", s: "Only adults may enter.", c: "If age >= 18, console.log 'Gate Open', else 'Gate Closed'. Set age to 20.", e: "Gate Open", start: "let age = 20;\n// Write your if statement here\n" },
      { t: "Password Check", s: "Enter the secret word.", c: "If password is 'open', console.log 'Access Granted'. Set it to 'open'.", e: "Access Granted", start: "let password = 'open';\n\n" },
      { t: "Temperature Alert", s: "The core is overheating.", c: "If temp > 100, console.log 'Danger'. Set temp to 105.", e: "Danger", start: "let temp = 105;\n\n" },
      { t: "Discount Code", s: "Apply the discount.", c: "If code is 'SAVE', console.log 'Discount Applied'.", e: "Discount Applied", start: "let code = 'SAVE';\n\n" },
      { t: "Game Over Check", s: "Did you lose?", c: "If lives === 0, console.log 'Game Over'. Set lives to 0.", e: "Game Over", start: "let lives = 0;\n\n" }
    ],
    boss: { t: "The Logic Labyrinth", s: "A maze of tricky conditions.", c: "If x is true and y is false, console.log 'Escape'. Set x=true, y=false.", e: "Escape", start: "let x = true;\nlet y = false;\n\n" }
  },
  {
    name: "Loop Dungeon",
    topic: "Loops",
    scenarios: [
      { t: "Countdown", s: "The rocket is launching.", c: "Use a loop to console.log numbers 3, 2, 1. (Output exactly '3 2 1' as a single string if possible, or just let logs match '1')", e: "1", start: "for (let i = 3; i > 0; i--) {\n  console.log(i);\n}" },
      { t: "Repeat Phrase", s: "Echo chamber.", c: "Loop 3 times and console.log 'Echo'.", e: "Echo", start: "for(let i=0; i<3; i++){\n  console.log('Echo');\n}" },
      { t: "Sum Array", s: "Add the treasures.", c: "Loop through [10, 20] and console.log the total sum.", e: "30", start: "let arr = [10, 20];\nlet sum = 0;\n\nconsole.log(sum);" },
      { t: "Find Target", s: "Search the dungeon.", c: "Loop until you find 'Key', then console.log 'Found'.", e: "Found", start: "let items = ['Rock', 'Key'];\n\n" },
      { t: "Print Evens", s: "Only even steps are safe.", c: "Loop 1 to 4 and console.log even numbers.", e: "4", start: "for(let i=1; i<=4; i++){\n  if(i%2===0) console.log(i);\n}" }
    ],
    boss: { t: "The Infinite Loop Trap", s: "Don't get stuck forever!", c: "Write a loop that runs exactly once and console.log 'Escaped'.", e: "Escaped", start: "while(true){\n  console.log('Escaped');\n  break;\n}" }
  },
  {
    name: "Array Kingdom",
    topic: "Arrays",
    scenarios: [
      { t: "The Royal Treasury", s: "Store the gold.", c: "Create an array `treasury` with 'Gold'. console.log(treasury[0]).", e: "Gold", start: "let treasury = [];\n\nconsole.log(treasury[0]);" },
      { t: "Add a Knight", s: "A new knight joins.", c: "Push 'Sir Code' to `knights`. console.log(knights[0]).", e: "Sir Code", start: "let knights = [];\n\nconsole.log(knights[0]);" },
      { t: "Remove the Traitor", s: "Pop the last element.", c: "Pop 'Traitor' from `court`. console.log(court.length).", e: "0", start: "let court = ['Traitor'];\n\nconsole.log(court.length);" },
      { t: "Find the Crown", s: "Use indexOf.", c: "console.log the index of 'Crown' in `items`.", e: "1", start: "let items = ['Sword', 'Crown'];\n\n" },
      { t: "Count the Jewels", s: "Check array length.", c: "console.log the length of `jewels`.", e: "3", start: "let jewels = ['Ruby', 'Diamond', 'Emerald'];\n\n" }
    ],
    boss: { t: "The Matrix Dragon", s: "A 2D array dragon attacks!", c: "Access the 'Fire' element in `dragon[0][1]`. console.log it.", e: "Fire", start: "let dragon = [['Scale', 'Fire']];\n\n" }
  }
];

const levels = [];

worldsData.forEach((worldData) => {
  worldData.scenarios.forEach((scenario, sIdx) => {
    levels.push({
      world: worldData.name,
      levelNumber: sIdx + 1,
      title: scenario.t,
      story: scenario.s,
      challengeText: scenario.c,
      gameType: "CODE_WRITE",
      language: "javascript",
      initialCode: scenario.start,
      expectedOutput: scenario.e,
      validationId: "generic_validation",
      xpReward: 50,
      difficulty: "BEGINNER",
      isBossLevel: false
    });
  });

  levels.push({
    world: worldData.name,
    levelNumber: 6,
    title: `Boss: ${worldData.boss.t}`,
    story: worldData.boss.s,
    challengeText: worldData.boss.c,
    gameType: "CODE_WRITE",
    language: "javascript",
    initialCode: worldData.boss.start,
    expectedOutput: worldData.boss.e,
    validationId: "generic_validation",
    xpReward: 150,
    difficulty: "BOSS",
    isBossLevel: true
  });
});

const achievements = [
  { name: "First Challenge Completed", description: "Welcome to the Arcade.", icon: "🏆", type: "FIRST_CHALLENGE", target: 1 },
  { name: "Variable Explorer", description: "Completed 5 Arcade levels.", icon: "🧩", type: "LEVEL_COMPLETE", target: 5 },
  { name: "Function Master", description: "Completed 15 Arcade levels.", icon: "⚙️", type: "LEVEL_COMPLETE", target: 15 },
  { name: "Bug Hunter", description: "Defeated your first Boss.", icon: "🐛", type: "BOSS_DEFEATED", target: 1 }
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
    console.log('30 Real Arcade Levels and 4 Achievements Seeded Successfully!');

    const validatorDir = path.join(__dirname, '../validators/arcade');
    if (!fs.existsSync(validatorDir)) {
      fs.mkdirSync(validatorDir, { recursive: true });
    }

    const genericValidator = `
module.exports = async function validateCode(context, code, level, logs) {
  if (!level || !level.expectedOutput) {
    return { passed: true };
  }

  const expected = String(level.expectedOutput).trim();
  const actual = logs.length > 0 ? String(logs[logs.length - 1]).trim() : "undefined";

  if (actual === expected) {
    return { passed: true };
  } else {
    return { 
      passed: false, 
      error: \`Expected:
\${expected}

Received:
\${actual}\`
    };
  }
};
`;
    fs.writeFileSync(path.join(validatorDir, 'generic_validation.js'), genericValidator);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
