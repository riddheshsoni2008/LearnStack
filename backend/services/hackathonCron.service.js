const cron = require('node-cron');
const Hackathon = require('../models/Hackathon');
const HackathonRegistration = require('../models/HackathonRegistration');
const HackathonSubmission = require('../models/HackathonSubmission');
const HackathonQuestion = require('../models/HackathonQuestion');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

const HACKATHON_DURATION_HOURS = parseInt(process.env.HACKATHON_DURATION_HOURS) || 72;
const HACKATHON_BREAK_MINUTES = parseInt(process.env.HACKATHON_BREAK_MINUTES) || 10;

// Start the cron job (runs every minute)
const startCronJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      await processCompletedHackathons();
      await transitionUpcomingHackathons();
      await ensureHackathonExists();
    } catch (error) {
      console.error('❌ Hackathon Cron Error:', error);
    }
  });
  console.log(`⏱️  Hackathon Cron Service initialized. Duration: ${HACKATHON_DURATION_HOURS}h, Break: ${HACKATHON_BREAK_MINUTES}m`);
};

// 1. End active hackathons and process results
const processCompletedHackathons = async () => {
  const now = new Date();
  
  // Find hackathons that should end
  const completedHackathons = await Hackathon.find({
    status: 'active',
    endDate: { $lte: now }
  });

  for (const hackathon of completedHackathons) {
    console.log(`🏆 Processing results for completed hackathon: ${hackathon.title}`);
    
    // Sort registrations by score (descending) and time (ascending)
    const registrations = await HackathonRegistration.find({
      hackathonId: hackathon._id,
      status: { $in: ['participating', 'qualified', 'winner', 'runner_up', 'registered'] }
    }).sort({ totalScore: -1, totalTimeTaken: 1 });

    let rank = 1;
    for (const reg of registrations) {
      // Only rank if they actually submitted something (score > 0)
      if ((reg.totalScore || 0) === 0) continue;

      const user = await User.findById(reg.userId);
      if (!user) continue;

      let status = 'qualified'; // By default if they have score
      let certType = 'HACKATHON_PARTICIPATION';

      if (rank === 1) {
        status = 'winner';
        certType = 'HACKATHON_WINNER';
      } else if (rank <= 3) {
        status = 'runner_up';
        certType = 'HACKATHON_QUALIFIED';
      }

      reg.status = status;
      reg.rank = rank;
      await reg.save();

      // Generate Certificate
      await Certificate.findOneAndUpdate(
        { userId: reg.userId, certificateType: certType, hackathonId: hackathon._id },
        {
          userId: reg.userId,
          certificateType: certType,
          hackathonId: hackathon._id,
          hackathonName: hackathon.title,
          studentName: user.name,
          completionPercentage: 100,
          totalLessons: 0,
          completedLessons: 0,
          totalQuizzes: hackathon.rounds.length,
          completedQuizzes: rank <= 3 ? hackathon.rounds.length : (reg.currentRound || 1) - 1,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify`
        },
        { upsert: true, new: true }
      );
      rank++;
    }

    // Mark as completed
    hackathon.status = 'completed';
    await hackathon.save();

    console.log(`✅ Results processed for ${hackathon.title}`);
  }
};

// 2. Transition upcoming hackathons to active
const transitionUpcomingHackathons = async () => {
  const now = new Date();
  
  // Find hackathons that should start
  const startingHackathons = await Hackathon.find({
    status: 'registration_open',
    startDate: { $lte: now }
  });

  for (const hackathon of startingHackathons) {
    console.log(`🚀 Starting hackathon: ${hackathon.title}`);
    hackathon.status = 'active';
    await hackathon.save();
  }
};

// 3. Ensure there is always an active or upcoming hackathon
const ensureHackathonExists = async () => {
  const activeOrUpcoming = await Hackathon.findOne({
    status: { $in: ['active', 'registration_open'] }
  });

  if (!activeOrUpcoming) {
    console.log('⚡ No active or upcoming hackathons found. Auto-creating the next one...');
    await autoCreateNextHackathon();
  }
};

const autoCreateNextHackathon = async () => {
  const now = new Date();
  
  // Find last hackathon to determine number
  const lastHackathon = await Hackathon.findOne().sort({ createdAt: -1 });
  let nextNumber = 1;
  if (lastHackathon && lastHackathon.title) {
    const match = lastHackathon.title.match(/#(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    } else {
      nextNumber = (await Hackathon.countDocuments()) + 1;
    }
  }

  // Calculate dates
  const startDate = new Date(now.getTime() + HACKATHON_BREAK_MINUTES * 60000);
  const endDate = new Date(startDate.getTime() + HACKATHON_DURATION_HOURS * 60 * 60000);
  
  // Find an admin user to set as creator
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.findOne(); // fallback
  }

  // Generate Rounds from global questions
  const allQuestions = await HackathonQuestion.find({ scope: 'global', isActive: true });
  const easyQs = shuffleArray(allQuestions.filter(q => q.difficulty === 'easy')).slice(0, 3).map(q => q._id);
  const medQs = shuffleArray(allQuestions.filter(q => q.difficulty === 'intermediate')).slice(0, 5).map(q => q._id);
  const hardQs = shuffleArray(allQuestions.filter(q => q.difficulty === 'advanced')).slice(0, 3).map(q => q._id);

  // Stagger rounds: Round 1 spans the entire hackathon (always available),
  // Round 2 after a break, Round 3 after Round 2.
  const rounds = [];

  // Round 1: Spans entire hackathon duration (always accessible after registration)
  if (easyQs.length > 0) {
    const r1Duration = 30; // minutes
    rounds.push(createRoundObj(1, 'Qualification Round', 'easy', startDate, endDate, r1Duration, 20, easyQs));
  }
  // Round 2 and 3: Sequential after hackathon start
  let roundStart = new Date(startDate.getTime() + 30 * 60000); // After Round 1 duration
  if (medQs.length > 0) {
    const r2Duration = 45;
    const r2End = new Date(roundStart.getTime() + r2Duration * 60000);
    rounds.push(createRoundObj(2, 'Technical Challenge', 'intermediate', roundStart, r2End, r2Duration, 60, medQs));
    roundStart = r2End;
  }
  if (hardQs.length > 0) {
    const r3Duration = 60;
    const r3End = new Date(roundStart.getTime() + r3Duration * 60000);
    rounds.push(createRoundObj(3, 'Final Showdown', 'advanced', roundStart, r3End, r3Duration, 75, hardQs));
  }

  // If no questions exist in DB, still create one round with correct timing
  if (rounds.length === 0) {
    const defaultDuration = 30;
    rounds.push(createRoundObj(1, 'Qualification Round', 'easy', startDate, endDate, defaultDuration, 20, []));
  }

  const newHackathon = await Hackathon.create({
    title: `LearnStack Hackathon #${nextNumber}`,
    shortDescription: "Automated recurring hackathon. Compete and win exclusive prizes!",
    description: "Welcome to our automated recurring hackathons. Test your skills across multiple rounds, compete with peers, and climb the leaderboard. Good luck!",
    status: 'registration_open',
    startDate,
    endDate,
    prizePool: {
      first: "₹5,000",
      second: "₹2,500",
      third: "₹1,000"
    },
    participantLimitMode: 'unlimited',
    questionBankMode: 'global',
    hackathonMode: 'solo',
    createdBy: adminUser ? adminUser._id : null,
    rounds,
    rules: [
      "No cheating or plagiarism allowed.",
      "You must complete rounds within the given time.",
      "Rankings are based on score and completion time.",
      "Registrations close when the hackathon begins."
    ],
    faqs: [
      { question: "Who can participate?", answer: "Anyone registered on the platform!" },
      { question: "How are winners decided?", answer: "Winners are decided automatically based on maximum score and minimum time taken." }
    ]
  });

  console.log(`✨ Auto-created: ${newHackathon.title} (Starts: ${startDate.toLocaleString()})`);

  // ── AI Question Generation: If any round has 0 questions, generate them ──
  const hasEmptyRound = newHackathon.rounds.some(r => !r.questionIds || r.questionIds.length === 0);
  if (hasEmptyRound) {
    try {
      const { generateAllRoundQuestions } = require('./aiQuestionGenerator.service');
      const creatorId = adminUser ? adminUser._id : null;
      if (creatorId) {
        console.log('🤖 Triggering AI question generation for empty rounds...');
        await generateAllRoundQuestions(newHackathon._id, creatorId, false);
      }
    } catch (aiErr) {
      console.error('⚠️ AI Question generation failed (hackathon still created):', aiErr.message);
    }
  }
};

// Helper functions
const shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());

const createRoundObj = (num, title, diff, start, end, duration, score, qIds) => ({
  roundNumber: num,
  title,
  difficulty: diff,
  startTime: start,
  endTime: end,
  duration,
  qualifyingScore: score,
  questionIds: qIds,
  type: diff === 'advanced' ? 'project' : 'quiz', // Just a varied heuristic
  status: 'upcoming'
});

module.exports = { startCronJob };
