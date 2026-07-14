import mongoose from 'mongoose';
import Hackathon from '../models/Hackathon';
import HackathonRegistration from '../models/HackathonRegistration';
import HackathonSubmission from '../models/HackathonSubmission';
import HackathonChallenge from '../models/HackathonChallenge';
import { evaluateSubmission } from '../services/judge.service';

// Predefined pool of unique full-stack project challenges
const challengePool = [
  {
    challengeTitle: "Build a Student Attendance Tracker",
    businessScenario: "Schools need a digital way to track attendance instead of paper registers.",
    problemStatement: "Teachers need an efficient way to track daily student attendance, manage leaves, and generate monthly reports without manual paperwork.",
    requirements: ["User authentication for teachers and students", "Dashboard to mark and view attendance", "Leave request and approval system", "Monthly attendance report generation"],
    bonusFeatures: ["Automated email notifications for low attendance", "QR code-based attendance marking", "Export reports to CSV/PDF"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Mini CRM System",
    businessScenario: "Small businesses are losing track of customer interactions.",
    problemStatement: "Small businesses struggle to keep track of their customer interactions, leads, and sales pipelines using spreadsheets. They need a centralized mini CRM.",
    requirements: ["Dashboard to view sales pipeline", "Contact management (add, edit, delete customers)", "Lead tracking with status updates", "Activity logging for each contact"],
    bonusFeatures: ["Data visualization charts for sales", "Reminders for follow-ups", "Search and filter functionality"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Complaint Management Portal",
    businessScenario: "Housing societies need a transparent way to resolve maintenance issues.",
    problemStatement: "Residents in a housing society need a transparent system to log maintenance complaints, track their resolution status, and provide feedback.",
    requirements: ["Role-based access for Residents and Admins", "Form to submit complaints with image upload", "Status tracking (Pending, In Progress, Resolved)", "Admin dashboard to assign complaints"],
    bonusFeatures: ["Real-time notifications for status updates", "Feedback and rating system post-resolution", "Priority tagging (Low, Medium, High)"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Job Application Tracker",
    businessScenario: "Job seekers are applying to dozens of companies but losing track of statuses.",
    problemStatement: "Job seekers apply to dozens of companies but lose track of application statuses, interview dates, and recruiter feedback. They need a personal tracking tool.",
    requirements: ["User authentication", "Add and manage job applications", "Kanban board to drag and drop application statuses", "Notes section for interview preparation"],
    bonusFeatures: ["Browser extension integration to quick-add jobs", "Email parsing to automatically update statuses", "Analytics on application success rate"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Hospital Appointment Booking System",
    businessScenario: "Patients face long wait times because clinics lack online booking.",
    problemStatement: "Patients experience long wait times to book appointments. A digital system is needed for patients to view doctor availability and book slots online.",
    requirements: ["Doctor directory with specialization filters", "Calendar view for available time slots", "Patient booking interface", "Doctor dashboard to view daily appointments"],
    bonusFeatures: ["Automated SMS/Email reminders", "Teleconsultation video link integration", "Prescription upload and viewing"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build an Event Registration Platform",
    businessScenario: "Local organizers struggle with manual event registrations and ticketing.",
    problemStatement: "Organizers need a unified platform to create events, manage attendee registrations, and issue tickets.",
    requirements: ["Event creation with date, time, and capacity", "User registration for specific events", "Attendee list dashboard for organizers", "Automatic ticket generation"],
    bonusFeatures: ["QR code generation and scanning for check-ins", "Waitlist management when capacity is reached", "Integration with a payment gateway simulation"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Library Management Dashboard",
    businessScenario: "A local library is digitizing its catalog from index cards.",
    problemStatement: "A local library is digitizing its catalog and needs a system to manage book inventory, member borrowing, and due dates.",
    requirements: ["Catalog management (add, update, remove books)", "Member registration and management", "Checkout and return processing", "Dashboard showing overdue books"],
    bonusFeatures: ["Automated fine calculation for late returns", "Search interface with genre and author filters", "Reservation system for currently borrowed books"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Smart Inventory System",
    businessScenario: "Retail stores need to prevent stockouts with an automated system.",
    problemStatement: "A retail store needs to track stock levels, manage suppliers, and receive alerts when products are running low.",
    requirements: ["Product catalog with SKU, price, and stock levels", "Supplier management interface", "Stock adjustment logging (in/out)", "Low stock alert dashboard"],
    bonusFeatures: ["Barcode scanning simulation for quick updates", "Sales forecasting based on past data", "Automated purchase order generation"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Course Enrollment Platform",
    businessScenario: "Private tutors want to sell their courses online directly.",
    problemStatement: "An educational institute needs a portal for students to browse available courses, enroll, and track their progress.",
    requirements: ["Course catalog with descriptions and prerequisites", "Student enrollment flow", "Instructor dashboard to manage courses", "Progress tracking for students"],
    bonusFeatures: ["Discussion forum for each course", "Certificate generation upon completion", "Integration with video hosting services"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  },
  {
    challengeTitle: "Build a Team Task Management Tool",
    businessScenario: "Remote teams need a lightweight alternative to Jira.",
    problemStatement: "Remote teams struggle to coordinate tasks and deadlines. They need a collaborative tool to assign work and track project milestones.",
    requirements: ["Workspace creation and team invitations", "Task assignment with deadlines and priorities", "Comment section on individual tasks", "Project progress dashboard"],
    bonusFeatures: ["Integration with popular chat tools", "Time tracking for individual tasks", "Gantt chart view for project timelines"],
    evaluationCriteria: ["Functionality (40%)", "Code Quality (20%)", "UI/UX (15%)", "Database Design (10%)", "Scalability (10%)", "Innovation (5%)"],
    difficulty: "Medium"
  }
];

// @desc    Start Round 2 automatically (assign unique challenges)
// @route   POST /api/rounds/start-round-2
// @access  Private (Admin)
export const startRound2 = async (req, res) => {
  try {
    const { hackathonId } = req.body;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId is required' });

    // Fetch all qualified users
    const qualifiedRegistrations = await HackathonRegistration.find({
      hackathonId,
      status: 'qualified'
    });

    if (qualifiedRegistrations.length === 0) {
      return res.status(400).json({ success: false, message: 'No qualified users found.' });
    }

    // Assign unique challenges
    const assignments = [];
    const availableChallenges = [...challengePool];

    // Simple shuffle
    availableChallenges.sort(() => Math.random() - 0.5);

    for (let i = 0; i < qualifiedRegistrations.length; i++) {
      const reg = qualifiedRegistrations[i];
      // Use modulus if we have more users than pool items, otherwise unique
      const challengeTemplate = availableChallenges[i % availableChallenges.length];

      // Create challenge
      const newChallenge = await HackathonChallenge.findOneAndUpdate(
        { hackathonId, assignedTo: reg.userId },
        {
          hackathonId,
          assignedTo: reg.userId,
          ...challengeTemplate
        },
        { upsert: true, new: true }
      );
      assignments.push(newChallenge);

      // Update registration status -> participating (Active for Round 2)
      reg.status = 'participating';
      reg.currentRound = 2;
      await reg.save();
    }

    res.status(200).json({
      success: true,
      message: 'Round 2 started successfully. Challenges assigned.',
      assignedCount: assignments.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's unique challenge
// @route   GET /api/challenges/my-challenge
// @access  Private
export const getMyChallenge = async (req, res) => {
  try {
    const { hackathonId } = req.query; // optional if global, but good for filtering
    const filter: any = { assignedTo: req.user._id };
    if (hackathonId) filter.hackathonId = hackathonId;

    const challenge = await HackathonChallenge.findOne(filter);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'No challenge assigned to you.' });
    }

    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Round 2 Solution
// @route   POST /api/submissions/submit
// @access  Private
export const submitRound = async (req, res) => {
  try {
    const { hackathonId, roundNumber, projectFiles } = req.body;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId required' });
    const round = parseInt(roundNumber) || 2;

    let submission = await HackathonSubmission.findOne({
      hackathonId,
      userId: req.user._id,
      roundNumber: round
    } as any);

    if (!submission) {
      submission = new HackathonSubmission({
        hackathonId,
        userId: req.user._id,
        roundNumber: round,
        startedAt: new Date()
      });
    }

    if (projectFiles && Array.isArray(projectFiles)) {
      submission.projectFiles = projectFiles;
    }
    submission.status = 'submitted';
    submission.submittedAt = new Date();

    // Run Automated Evaluation
    const evalResult = evaluateSubmission(projectFiles || submission.projectFiles || []);

    submission.totalScore = evalResult.score;
    submission.maxPossibleScore = 60;
    submission.percentage = Math.round((evalResult.score / 60) * 100);
    submission.status = evalResult.status as any; // 'QUALIFIED' or 'DISQUALIFIED'
    submission.evalReport = evalResult.summary + '\n\n' + evalResult.failureReasons.join('\n');
    submission.evalScoreBreakdown = {
      authentication: evalResult.breakdown.auth,
      attendance: evalResult.breakdown.attendance,
      leaveSystem: evalResult.breakdown.leave,
      reports: evalResult.breakdown.reports,
      codeQuality: evalResult.breakdown.codeQuality,
      uiUx: evalResult.breakdown.uiUx
    };
    submission.evalScores = {
      functionality: evalResult.breakdown.attendance + evalResult.breakdown.leave + evalResult.breakdown.reports,
      codeQuality: evalResult.breakdown.codeQuality,
      uiUx: evalResult.breakdown.uiUx,
      databaseDesign: evalResult.breakdown.auth,
      scalability: 0,
      innovation: 0
    };

    await submission.save();

    // Update registration status
    const registration = await HackathonRegistration.findOne({
      hackathonId,
      userId: req.user._id
    });
    if (registration) {
      registration.totalScore = evalResult.score;
      if (evalResult.unlockRound3) {
        registration.status = 'ROUND_3_QUALIFIED';
        registration.currentRound = 3;
      } else {
        registration.status = 'disqualified';
      }
      await registration.save();
    }

    res.status(200).json({ success: true, message: evalResult.unlockRound3 ? 'Submission successful! You qualified for Round 3!' : 'Submission completed.', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const autoSaveRound = async (req, res) => {
  try {
    const { hackathonId, roundNumber, projectFiles } = req.body;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId required' });
    const round = parseInt(roundNumber) || 2;

    let submission = await HackathonSubmission.findOne({
      hackathonId,
      userId: req.user._id,
      roundNumber: round
    } as any);

    if (!submission) {
      submission = new HackathonSubmission({
        hackathonId,
        userId: req.user._id,
        roundNumber: round,
        startedAt: new Date()
      });
    }

    if (projectFiles && Array.isArray(projectFiles)) {
      submission.projectFiles = projectFiles;
    }
    submission.status = 'IN_PROGRESS';
    submission.lastSavedAt = new Date();

    await submission.save();

    res.status(200).json({ success: true, message: 'Auto-save successful', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for a round (Admin)
// @route   GET /api/rounds/admin/submissions
// @access  Private (Admin)
export const getRoundSubmissions = async (req, res) => {
  try {
    const { hackathonId, roundNumber } = req.query;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId required' });
    const round = parseInt(roundNumber) || 2;

    const submissions = await HackathonSubmission.find({
      hackathonId,
      roundNumber: round
    } as any).populate('userId', 'name email');

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Evaluate Round 2 submissions
// @route   POST /api/rounds/evaluate
// @access  Private (Admin)
export const evaluateRound2 = async (req, res) => {
  try {
    const { hackathonId } = req.body;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId required' });

    const submissions = await HackathonSubmission.find({
      hackathonId,
      roundNumber: 2
    } as any);
    for (let sub of submissions) {
      const evalResult = evaluateSubmission(sub.projectFiles || []);
      
      sub.totalScore = evalResult.score;
      sub.maxPossibleScore = 60;
      sub.percentage = Math.round((evalResult.score / 60) * 100);
      sub.status = evalResult.status as any; // 'QUALIFIED' or 'DISQUALIFIED'
      sub.evalReport = evalResult.summary + '\n\n' + evalResult.failureReasons.join('\n');
      sub.evalScoreBreakdown = {
        authentication: evalResult.breakdown.auth,
        attendance: evalResult.breakdown.attendance,
        leaveSystem: evalResult.breakdown.leave,
        reports: evalResult.breakdown.reports,
        codeQuality: evalResult.breakdown.codeQuality,
        uiUx: evalResult.breakdown.uiUx
      };
      sub.evalScores = {
        functionality: evalResult.breakdown.attendance + evalResult.breakdown.leave + evalResult.breakdown.reports,
        codeQuality: evalResult.breakdown.codeQuality,
        uiUx: evalResult.breakdown.uiUx,
        databaseDesign: evalResult.breakdown.auth,
        scalability: 0,
        innovation: 0
      };

      await sub.save();

      // Update registration status
      const reg = await HackathonRegistration.findOne({ hackathonId, userId: sub.userId });
      if (reg) {
        reg.totalScore = sub.totalScore; // sync total score
        if (evalResult.unlockRound3) {
          reg.status = 'ROUND_3_QUALIFIED';
          reg.currentRound = 3;
        } else {
          reg.status = 'disqualified';
        }
        await reg.save();
      }
    }

    res.status(200).json({ success: true, message: 'All submissions evaluated automatically.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Leaderboard
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const { hackathonId } = req.query;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId required' });

    const registrations = await HackathonRegistration.find({ hackathonId })
      .populate('userId', 'name email')
      .sort({ totalScore: -1, totalTimeTaken: 1 });

    const leaderboard = registrations.map((reg, idx) => ({
      rank: idx + 1,
      userId: (reg.userId as any)._id,
      name: (reg.userId as any).name,
      score: reg.totalScore,
      status: reg.status
    }));

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Select Top 20 and Close Round 2
// @route   POST /api/rounds/select-top-20
// @access  Private (Admin)
export const selectTop20 = async (req, res) => {
  try {
    const { hackathonId } = req.body;
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId required' });

    const registrations = await HackathonRegistration.find({
      hackathonId,
      currentRound: 2
    }).sort({ totalScore: -1 });

    let qualifiedCount = 0;

    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i];
      if (i < 20) {
        reg.status = 'qualified'; // Passed Round 2 -> Qualified for Round 3
        reg.currentRound = 3;
        qualifiedCount++;
      } else {
        reg.status = 'disqualified'; // Failed
      }
      await reg.save();
    }

    // Close Round 2
    const hackathon = await Hackathon.findById(hackathonId);
    if (hackathon) {
      const round2 = hackathon.rounds.find(r => r.roundNumber === 2);
      if (round2) round2.status = 'completed';
      const round3 = hackathon.rounds.find(r => r.roundNumber === 3);
      if (round3) round3.status = 'active';

      await hackathon.save();
    }

    res.status(200).json({
      success: true,
      message: 'Top 20 selected. Round 2 Closed. Round 3 Active.',
      qualifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { challengePool as challengePool };

