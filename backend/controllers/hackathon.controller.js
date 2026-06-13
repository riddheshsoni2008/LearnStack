const Hackathon = require('../models/Hackathon');
const HackathonRegistration = require('../models/HackathonRegistration');
const HackathonSubmission = require('../models/HackathonSubmission');
const HackathonQuestion = require('../models/HackathonQuestion');
const Certificate = require('../models/Certificate');

// Fisher-Yates shuffle for randomizing MCQ option order
const shuffleArrayFisherYates = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// @desc    List all published hackathons
// @route   GET /api/hackathons
// @access  Public
const listHackathons = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { status: { $ne: 'draft' } };
    if (status) filter.status = status;

    const hackathons = await Hackathon.find(filter)
      .select('title slug shortDescription bannerImage status registrationStart registrationEnd startDate endDate prizePool currentParticipants participantLimitMode maxParticipants registrationType entryFee hackathonMode tags')
      .sort({ startDate: -1 });

    res.status(200).json({ success: true, data: hackathons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hackathon details by slug
// @route   GET /api/hackathons/:slug
// @access  Public
const getHackathonBySlug = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ slug: req.params.slug })
      .populate('rounds.questionIds', 'questionType category difficulty points');

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hackathon leaderboard
// @route   GET /api/hackathons/:slug/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ slug: req.params.slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const registrations = await HackathonRegistration.find({
      hackathonId: hackathon._id,
      status: { $in: ['participating', 'qualified', 'winner', 'runner_up'] }
    })
      .populate('userId', 'name email')
      .sort({ totalScore: -1, totalTimeTaken: 1 })
      .limit(100);

    const leaderboard = registrations.map((reg, idx) => ({
      rank: idx + 1,
      name: reg.userId?.name || 'Unknown',
      college: reg.collegeName || '',
      state: reg.state || '',
      score: reg.totalScore,
      timeTaken: reg.totalTimeTaken,
      status: reg.status,
      currentRound: reg.currentRound
    }));

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get the current active or upcoming hackathon
// @route   GET /api/hackathons/current
// @access  Public
const getCurrentHackathon = async (req, res) => {
  try {
    // 1. Try to find an active hackathon first
    let hackathon = await Hackathon.findOne({ status: 'active' })
      .select('title slug shortDescription status startDate endDate participantLimitMode maxParticipants currentParticipants hackathonMode')
      .sort({ startDate: 1 });

    // 2. If no active, try to find an upcoming one (registration_open)
    if (!hackathon) {
      hackathon = await Hackathon.findOne({ status: 'registration_open' })
        .select('title slug shortDescription status startDate endDate participantLimitMode maxParticipants currentParticipants hackathonMode')
        .sort({ startDate: 1 });
    }

    if (!hackathon) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATED ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// @desc    Register for a hackathon (NO Arcade dependency)
// @route   POST /api/hackathons/:slug/register
// @access  Private
const registerForHackathon = async (req, res) => {
  try {
    let hackathon = await Hackathon.findOne({ slug: req.params.slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check registration window
    const now = new Date();
    const cutoffTime = hackathon.endDate ? new Date(hackathon.endDate.getTime() - 12 * 60 * 60 * 1000) : null;

    if (cutoffTime && now >= cutoffTime) {
      console.log(`[DEBUG] REASON: Current Time >= Cutoff Time => Registration Closed`);

      const nextHackathon = await Hackathon.findOne({ status: 'registration_open' }).sort({ startDate: 1 });
      if (nextHackathon) {
        console.log(`[DEBUG] Redirecting registration to next upcoming hackathon: ${nextHackathon.title}`);
        hackathon = nextHackathon;
      } else {
        return res.status(400).json({ success: false, message: 'Registration has closed for this hackathon.' });
      }
    } else {
      console.log(`[DEBUG] Current Time < Cutoff Time => Registration Open`);
    }

    if (hackathon.status !== 'registration_open' && hackathon.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Hackathon is not open for registration.' });
    }

    if (hackathon.participantLimitMode === 'custom' && hackathon.maxParticipants > 0) {
      if (hackathon.currentParticipants >= hackathon.maxParticipants) {
        return res.status(400).json({ success: false, message: 'Hackathon is full. No more registrations allowed.' });
      }
    }

    const existing = await HackathonRegistration.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for this hackathon.' });
    }

    const { collegeName, studentId, githubUrl, linkedinUrl, state, portfolioUrl, resumeUrl } = req.body;

    // Strict validation
    if (!collegeName || !collegeName.trim()) return res.status(400).json({ success: false, message: 'College / University is required' });
    if (!studentId || !studentId.trim()) return res.status(400).json({ success: false, message: 'Student ID is required' });
    if (!state || !state.trim()) return res.status(400).json({ success: false, message: 'State is required' });
    if (!githubUrl || !githubUrl.trim()) return res.status(400).json({ success: false, message: 'GitHub URL is required' });
    if (!linkedinUrl || !linkedinUrl.trim()) return res.status(400).json({ success: false, message: 'LinkedIn URL is required' });

    // Determine payment status
    let paymentStatus = 'not_required';
    if (hackathon.registrationType === 'paid') {
      paymentStatus = 'pending'; // Future: integrate Razorpay/Stripe here
    }

    const registration = await HackathonRegistration.create({
      hackathonId: hackathon._id,
      userId: req.user._id,
      collegeName: collegeName.trim(),
      studentId: studentId.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : '',
      resumeUrl: resumeUrl ? resumeUrl.trim() : '',
      state: state.trim(),
      paymentStatus
    });

    // Increment participant count
    await Hackathon.findByIdAndUpdate(hackathon._id, { $inc: { currentParticipants: 1 } });

    res.status(201).json({ success: true, data: registration, message: 'Successfully registered!', redirectSlug: hackathon.slug });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You are already registered for this hackathon.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's registration status
// @route   GET /api/hackathons/:slug/my-status
// @access  Private
const getMyStatus = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ slug: req.params.slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const registration = await HackathonRegistration.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(200).json({ success: true, data: { registered: false } });
    }

    // Get submissions
    const submissions = await HackathonSubmission.find({
      hackathonId: hackathon._id,
      userId: req.user._id
    }).sort({ roundNumber: 1 });

    res.status(200).json({
      success: true,
      data: {
        registered: true,
        registration,
        submissions,
        hackathon: {
          rounds: hackathon.rounds,
          status: hackathon.status,
          title: hackathon.title
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get round questions (if qualified for that round)
// @route   GET /api/hackathons/:slug/rounds/:roundNumber
// @access  Private
const getRoundQuestions = async (req, res) => {
  try {
    const { slug, roundNumber } = req.params;
    const round = parseInt(roundNumber);

    const hackathon = await Hackathon.findOne({ slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const registration = await HackathonRegistration.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(403).json({ success: false, message: 'You are not registered for this hackathon.' });
    }

    if (registration.status === 'disqualified') {
      return res.status(403).json({ success: false, message: 'You have been disqualified from this hackathon.' });
    }

    // Check if qualified for this round
    if (round > 1) {
      const prevSubmission = await HackathonSubmission.findOne({
        hackathonId: hackathon._id,
        userId: req.user._id,
        roundNumber: round - 1
      });
      if (!prevSubmission || prevSubmission.status === 'disqualified') {
        return res.status(403).json({ success: false, message: `You did not qualify for Round ${round}.` });
      }
    }

    // Find the round
    const roundData = hackathon.rounds.find(r => r.roundNumber === round);
    if (!roundData) {
      return res.status(404).json({ success: false, message: 'Round not found.' });
    }

    // Check round timing — Round 1 is always accessible after registration
    if (round > 1) {
      const now = new Date();
      if (now < roundData.startTime) {
        return res.status(400).json({ success: false, message: 'This round has not started yet.' });
      }
      if (now > roundData.endTime) {
        return res.status(400).json({ success: false, message: 'This round has ended.' });
      }
    }

    // Check if already submitted
    const existingSubmission = await HackathonSubmission.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id,
      roundNumber: round,
      status: { $in: ['AUTO_SUBMITTED', 'COMPLETED', 'QUALIFIED', 'DISQUALIFIED', 'evaluated', 'submitted'] }
    });
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: 'You have already submitted this round.' });
    }

    // Check if in progress
    let submission = await HackathonSubmission.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id,
      roundNumber: round,
      status: 'IN_PROGRESS'
    });

    if (!submission) {
      // Not started yet
      return res.status(200).json({
        success: true,
        data: {
          round: {
            roundNumber: roundData.roundNumber,
            title: roundData.title,
            duration: roundData.duration,
            endTime: roundData.endTime,
            type: roundData.type,
            qualifyingScore: roundData.qualifyingScore
          },
          started: false
        }
      });
    }

    // Already started, return questions and timer state
    const questionIdsToFetch = submission.assignedQuestionIds && submission.assignedQuestionIds.length > 0
      ? submission.assignedQuestionIds
      : roundData.questionIds;

    const questions = await HackathonQuestion.find({
      _id: { $in: questionIdsToFetch }
    }).select('-correctAnswer -testCases -explanation');

    // Shuffle MCQ options and strip isCorrect (security: don't leak correct answer to frontend)
    const shuffledQuestions = questions.map(q => {
      const qObj = q.toObject();
      if (qObj.questionType === 'mcq' && qObj.options && qObj.options.length > 1) {
        qObj.options = shuffleArrayFisherYates([...qObj.options]).map(opt => ({
          text: opt.text
        }));
      }
      return qObj;
    });

    res.status(200).json({
      success: true,
      data: {
        round: {
          roundNumber: roundData.roundNumber,
          title: roundData.title,
          duration: roundData.duration,
          endTime: roundData.endTime,
          type: roundData.type,
          qualifyingScore: roundData.qualifyingScore
        },
        questions: shuffledQuestions,
        submissionId: submission._id,
        startedAt: submission.startedAt,
        started: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start a round (starts timer and fetches questions)
// @route   POST /api/hackathons/:slug/rounds/:roundNumber/start
// @access  Private
const startRound = async (req, res) => {
  try {
    const { slug, roundNumber } = req.params;
    const round = parseInt(roundNumber);

    const hackathon = await Hackathon.findOne({ slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const roundData = hackathon.rounds.find(r => r.roundNumber === round);
    if (!roundData) return res.status(404).json({ success: false, message: 'Round not found.' });

    // Check round timing — Round 1 is always accessible after registration
    if (round > 1) {
      const now = new Date();
      if (now < roundData.startTime) return res.status(400).json({ success: false, message: 'This round has not started yet.' });
      if (now > roundData.endTime) return res.status(400).json({ success: false, message: 'This round has ended.' });
    }

    // Check if submission exists
    let submission = await HackathonSubmission.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id,
      roundNumber: round
    });

    if (submission) {
      return res.status(400).json({ success: false, message: 'You have already started or submitted this round.' });
    }

    // Dynamic Question Selection & Anti-Repeat System
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pastSubmissions = await HackathonSubmission.find({
      userId: req.user._id,
      createdAt: { $gte: thirtyDaysAgo }
    });
    let seenQuestionIds = [];
    pastSubmissions.forEach(sub => {
      if (sub.assignedQuestionIds) {
        seenQuestionIds = seenQuestionIds.concat(sub.assignedQuestionIds);
      }
    });

    let questions = [];
    if (round === 1) {
      questions = await HackathonQuestion.aggregate([
        { $match: { scope: 'global', questionType: 'mcq', _id: { $nin: seenQuestionIds } } },
        { $sample: { size: 3 } }
      ]);
      if (questions.length < 3) {
        questions = await HackathonQuestion.aggregate([
          { $match: { scope: 'global', questionType: 'mcq' } },
          { $sample: { size: 3 } }
        ]);
      }
    } else if (round === 2) {
      questions = await HackathonQuestion.aggregate([
        { $match: { scope: 'global', questionType: 'mcq', _id: { $nin: seenQuestionIds } } },
        { $sample: { size: 2 } }
      ]);
      if (questions.length < 2) {
        questions = await HackathonQuestion.aggregate([
          { $match: { scope: 'global', questionType: 'mcq' } },
          { $sample: { size: 2 } }
        ]);
      }
    } else if (round === 3) {
      questions = await HackathonQuestion.aggregate([
        { $match: { scope: 'global', questionType: 'project', _id: { $nin: seenQuestionIds } } },
        { $sample: { size: 1 } }
      ]);
      if (questions.length < 1) {
        questions = await HackathonQuestion.aggregate([
          { $match: { scope: 'global', questionType: 'project' } },
          { $sample: { size: 1 } }
        ]);
      }
    } else {
      questions = await HackathonQuestion.find({ _id: { $in: roundData.questionIds } }).lean();
    }

    const questionIds = questions.map(q => q._id);

    // Shuffle MCQ options and strip sensitive data
    const shuffledQuestions = questions.map(q => {
      const qObj = { ...q };
      delete qObj.correctAnswer;
      delete qObj.testCases;
      delete qObj.explanation;

      if (qObj.questionType === 'mcq' && qObj.options && qObj.options.length > 1) {
        qObj.options = shuffleArrayFisherYates([...qObj.options]).map(opt => ({
          text: opt.text
        }));
      }
      return qObj;
    });

    submission = await HackathonSubmission.create({
      hackathonId: hackathon._id,
      userId: req.user._id,
      roundNumber: round,
      status: 'IN_PROGRESS',
      assignedQuestionIds: questionIds,
      startedAt: new Date(),
      maxPossibleScore: questions.reduce((acc, q) => acc + (q.points || 10), 0)
    });

    res.status(200).json({
      success: true,
      data: {
        questions: shuffledQuestions,
        submissionId: submission._id,
        startedAt: submission.startedAt,
        started: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit round answers
// @route   POST /api/hackathons/:slug/rounds/:roundNumber/submit
// @access  Private
const submitRound = async (req, res) => {
  try {
    const { slug, roundNumber } = req.params;
    const round = parseInt(roundNumber);
    const { answers, autoSubmitted, projectUrl, projectDescription, projectTechStack } = req.body;

    const hackathon = await Hackathon.findOne({ slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const roundData = hackathon.rounds.find(r => r.roundNumber === round);
    if (!roundData) return res.status(404).json({ success: false, message: 'Round not found.' });

    // Find in-progress submission
    let submission = await HackathonSubmission.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id,
      roundNumber: round,
      status: 'IN_PROGRESS'
    });

    if (!submission) {
      return res.status(400).json({ success: false, message: 'No active submission found for this round or already submitted.' });
    }

    // Verify timeTaken (Anti-cheat)
    const totalTimeTaken = submission.startedAt
      ? Math.round((Date.now() - new Date(submission.startedAt).getTime()) / 1000)
      : 0;

    // Optional: if timeTaken > roundData.duration * 60 + grace period (e.g. 60s), we could flag it, but for now just cap it.

    let totalScore = 0;
    const gradedAnswers = [];

    let answeredCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = roundData.questionIds.length;

    if (answers && answers.length > 0) {
      const questionIds = answers.map(a => a.questionId);
      const questions = await HackathonQuestion.find({ _id: { $in: questionIds } });
      const questionMap = {};
      questions.forEach(q => { questionMap[q._id.toString()] = q; });

      for (const ans of answers) {
        const question = questionMap[ans.questionId];
        if (!question) continue;

        let isCorrect = false;
        let pointsAwarded = 0;
        let isAnswered = false;

        if (question.questionType === 'mcq') {
          isAnswered = ans.selectedOptionIndex !== -1 && ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex !== null;
          if (isAnswered) {
            // Match by option TEXT, not index — options are shuffled before being sent to the frontend,
            // so the selectedOptionIndex doesn't correspond to the original DB order.
            // The frontend sends the selected option's text in ans.answer (see QuestionDisplay.js handleMCQSelect).
            const correctOptionText = question.options.find(o => o.isCorrect)?.text;
            const selectedText = (ans.answer || '').trim();
            isCorrect = !!correctOptionText && selectedText === correctOptionText.trim();
            pointsAwarded = isCorrect ? question.points : 0;
          }
        } else if (question.questionType === 'coding') {
          isAnswered = !!ans.answer?.trim();
          if (isAnswered) {
            isCorrect = ans.answer?.trim() === question.correctAnswer?.trim();
            pointsAwarded = isCorrect ? question.points : 0;
          }
        } else {
          isAnswered = !!ans.answer?.trim();
          pointsAwarded = 0; // Manual grading
        }

        if (isAnswered) {
          answeredCount++;
          if (question.questionType !== 'case_study' && question.questionType !== 'scenario' && question.questionType !== 'project') {
            if (isCorrect) correctCount++;
            else wrongCount++;
          }
        }

        totalScore += pointsAwarded;
        gradedAnswers.push({
          questionId: ans.questionId,
          answer: ans.answer || '',
          selectedOptionIndex: ans.selectedOptionIndex ?? -1,
          isCorrect,
          pointsAwarded,
          timeTaken: ans.timeTaken || 0
        });
      }
    }

    const questionIdsToEval = submission.assignedQuestionIds && submission.assignedQuestionIds.length > 0
      ? submission.assignedQuestionIds
      : roundData.questionIds;
    unansweredCount = questionIdsToEval.length - answeredCount;

    const maxPossibleScore = submission.maxPossibleScore || 1;
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Determine qualification based on strict rules
    let qualified = false;
    if (round === 1) {
      qualified = correctCount >= 2;
    } else if (round === 2) {
      qualified = correctCount >= 1; // At least 1 correct
    } else {
      const qualifyingScore = roundData.qualifyingScore || 50;
      qualified = totalScore >= qualifyingScore;
    }

    // Status
    let finalStatus = qualified ? 'QUALIFIED' : 'DISQUALIFIED';
    if (roundData.type === 'project') {
      finalStatus = autoSubmitted ? 'AUTO_SUBMITTED' : 'COMPLETED';
    } else if (autoSubmitted) {
      // We can mark it as AUTO_SUBMITTED or just store the boolean
    }

    // Update submission
    submission.answers = gradedAnswers;
    submission.totalScore = totalScore;
    submission.percentage = percentage;
    submission.totalTimeTaken = totalTimeTaken;
    submission.submittedAt = new Date();
    submission.autoSubmitted = autoSubmitted || false;
    submission.status = finalStatus;
    submission.stats = {
      answered: answeredCount,
      correct: correctCount,
      wrong: wrongCount,
      unanswered: unansweredCount
    };

    // We can attach stats to the submission object dynamically or save them. Since they are derived, we return them in the response.

    // Project fields
    if (projectUrl) submission.projectUrl = projectUrl;
    if (projectDescription) submission.projectDescription = projectDescription;
    if (projectTechStack) submission.projectTechStack = projectTechStack;

    await submission.save();

    // Update registration
    const registration = await HackathonRegistration.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id
    });

    if (registration) {
      registration.totalScore = (registration.totalScore || 0) + totalScore;
      registration.totalTimeTaken = (registration.totalTimeTaken || 0) + totalTimeTaken;

      if (finalStatus === 'QUALIFIED') {
        registration.currentRound = round + 1;
        registration.status = 'qualified';
      } else if (finalStatus === 'DISQUALIFIED') {
        registration.status = 'disqualified';
      }

      await registration.save();
    }

    res.status(200).json({
      success: true,
      data: {
        totalScore,
        maxPossibleScore,
        percentage,
        qualified,
        status: submission.status,
        timeTaken: totalTimeTaken,
        stats: {
          answered: answeredCount,
          correct: correctCount,
          wrong: wrongCount,
          unanswered: unansweredCount
        }
      },
      message: qualified
        ? `Congratulations! You qualified for Round ${round + 1}! 🎉`
        : `Round ${round} completed. Score: ${totalScore}. Required: ${qualifyingScore}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's detailed results
// @route   GET /api/hackathons/:slug/results
// @access  Private
const getResults = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ slug: req.params.slug });
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const registration = await HackathonRegistration.findOne({
      hackathonId: hackathon._id,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'You are not registered for this hackathon.' });
    }

    const submissions = await HackathonSubmission.find({
      hackathonId: hackathon._id,
      userId: req.user._id
    }).sort({ roundNumber: 1 });

    // Calculate rank
    const allRegistrations = await HackathonRegistration.find({
      hackathonId: hackathon._id,
      status: { $in: ['participating', 'qualified', 'winner', 'runner_up'] }
    }).sort({ totalScore: -1, totalTimeTaken: 1 });

    let rank = 0;
    for (let i = 0; i < allRegistrations.length; i++) {
      if (allRegistrations[i].userId.toString() === req.user._id.toString()) {
        rank = i + 1;
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        registration,
        submissions,
        rank,
        totalParticipants: allRegistrations.length,
        hackathonTitle: hackathon.title
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// @desc    Create a hackathon
// @route   POST /api/hackathons
// @access  Admin
const createHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: hackathon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A hackathon with this title already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a hackathon
// @route   PUT /api/hackathons/:id
// @access  Admin
const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a hackathon
// @route   DELETE /api/hackathons/:id
// @access  Admin
const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    // Clean up related data
    await HackathonRegistration.deleteMany({ hackathonId: req.params.id });
    await HackathonSubmission.deleteMany({ hackathonId: req.params.id });
    // Delete private questions only
    await HackathonQuestion.deleteMany({ hackathonId: req.params.id, scope: 'private' });

    res.status(200).json({ success: true, message: 'Hackathon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all participants
// @route   GET /api/hackathons/:id/participants
// @access  Admin
const getParticipants = async (req, res) => {
  try {
    const participants = await HackathonRegistration.find({
      hackathonId: req.params.id
    })
      .populate('userId', 'name email')
      .sort({ registeredAt: -1 });

    const data = participants.map((p, idx) => ({
      _id: p._id,
      name: p.userId?.name || 'Unknown',
      email: p.userId?.email || '',
      college: p.collegeName,
      studentId: p.studentId,
      state: p.state,
      githubUrl: p.githubUrl,
      linkedinUrl: p.linkedinUrl,
      status: p.status,
      totalScore: p.totalScore,
      totalTimeTaken: p.totalTimeTaken,
      currentRound: p.currentRound,
      rank: p.rank,
      registeredAt: p.registeredAt
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Declare winners and generate certificates
// @route   POST /api/hackathons/:id/declare-winners
// @access  Admin
const declareWinners = async (req, res) => {
  try {
    const { winners } = req.body;
    // winners: [{ userId, rank }]

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    for (const w of winners) {
      const status = w.rank === 1 ? 'winner' : 'runner_up';
      await HackathonRegistration.findOneAndUpdate(
        { hackathonId: hackathon._id, userId: w.userId },
        { status, rank: w.rank }
      );

      // Generate winner certificate
      const certType = w.rank === 1 ? 'HACKATHON_WINNER' : 'HACKATHON_QUALIFIED';
      const user = await require('../models/User').findById(w.userId);
      if (user) {
        await Certificate.findOneAndUpdate(
          { userId: w.userId, certificateType: certType, hackathonId: hackathon._id },
          {
            userId: w.userId,
            certificateType: certType,
            hackathonId: hackathon._id,
            hackathonName: hackathon.title,
            studentName: user.name,
            completionPercentage: 100,
            totalLessons: 0,
            completedLessons: 0,
            totalQuizzes: hackathon.rounds.length,
            completedQuizzes: hackathon.rounds.length,
            verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify`
          },
          { upsert: true, new: true }
        );
      }
    }

    // Generate participation certificates for all
    const allRegistrations = await HackathonRegistration.find({
      hackathonId: hackathon._id,
      status: { $ne: 'registered' }
    });

    for (const reg of allRegistrations) {
      const user = await require('../models/User').findById(reg.userId);
      if (user) {
        await Certificate.findOneAndUpdate(
          { userId: reg.userId, certificateType: 'HACKATHON_PARTICIPATION', hackathonId: hackathon._id },
          {
            userId: reg.userId,
            certificateType: 'HACKATHON_PARTICIPATION',
            hackathonId: hackathon._id,
            hackathonName: hackathon.title,
            studentName: user.name,
            completionPercentage: 100,
            totalLessons: 0,
            completedLessons: 0,
            totalQuizzes: hackathon.rounds.length,
            completedQuizzes: reg.currentRound - 1,
            verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify`
          },
          { upsert: true, new: true }
        );
      }
    }

    // Mark hackathon as completed
    hackathon.status = 'completed';
    await hackathon.save();

    res.status(200).json({ success: true, message: 'Winners declared and certificates generated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export results (JSON format — CSV/Excel/PDF handled on frontend)
// @route   GET /api/hackathons/:id/export
// @access  Admin
const exportResults = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const participants = await HackathonRegistration.find({ hackathonId: req.params.id })
      .populate('userId', 'name email')
      .sort({ totalScore: -1, totalTimeTaken: 1 });

    const submissions = await HackathonSubmission.find({ hackathonId: req.params.id })
      .sort({ userId: 1, roundNumber: 1 });

    // Build export data
    const exportData = participants.map((p, idx) => {
      const userSubmissions = submissions.filter(
        s => s.userId.toString() === p.userId?._id?.toString()
      );

      return {
        rank: idx + 1,
        name: p.userId?.name || 'Unknown',
        email: p.userId?.email || '',
        college: p.collegeName || '',
        studentId: p.studentId || '',
        state: p.state || '',
        githubUrl: p.githubUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        status: p.status,
        totalScore: p.totalScore,
        totalTimeTaken: p.totalTimeTaken,
        currentRound: p.currentRound,
        registeredAt: p.registeredAt,
        rounds: userSubmissions.map(s => ({
          roundNumber: s.roundNumber,
          score: s.totalScore,
          percentage: s.percentage,
          timeTaken: s.totalTimeTaken,
          status: s.status,
          submittedAt: s.submittedAt
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        hackathon: {
          title: hackathon.title,
          status: hackathon.status,
          totalParticipants: participants.length,
          exportedAt: new Date().toISOString()
        },
        participants: exportData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hackathons (admin — includes drafts)
// @route   GET /api/hackathons/admin/all
// @access  Admin
const adminListHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: hackathons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign questions to a hackathon round
// @route   POST /api/hackathons/:id/rounds/:roundNumber/questions
// @access  Admin
const assignQuestionsToRound = async (req, res) => {
  try {
    const { questionIds } = req.body; // Array of HackathonQuestion ObjectIds
    const { id, roundNumber } = req.params;
    const round = parseInt(roundNumber);

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const roundData = hackathon.rounds.find(r => r.roundNumber === round);
    if (!roundData) {
      return res.status(404).json({ success: false, message: `Round ${round} not found` });
    }

    // Validate all questionIds exist
    const questions = await HackathonQuestion.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return res.status(400).json({ success: false, message: 'Some question IDs are invalid.' });
    }

    roundData.questionIds = questionIds;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: `${questionIds.length} questions assigned to Round ${round}.`,
      data: { roundNumber: round, questionCount: questionIds.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a question from a hackathon round
// @route   DELETE /api/hackathons/:id/rounds/:roundNumber/questions/:questionId
// @access  Admin
const removeQuestionFromRound = async (req, res) => {
  try {
    const { id, roundNumber, questionId } = req.params;
    const round = parseInt(roundNumber);

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const roundData = hackathon.rounds.find(r => r.roundNumber === round);
    if (!roundData) {
      return res.status(404).json({ success: false, message: `Round ${round} not found` });
    }

    roundData.questionIds = roundData.questionIds.filter(
      qid => qid.toString() !== questionId
    );
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Question removed from round.',
      data: { roundNumber: round, questionCount: roundData.questionIds.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate AI questions for all rounds of a hackathon
// @route   POST /api/hackathons/:id/generate-questions
// @access  Admin
const generateAIQuestions = async (req, res) => {
  try {
    const { generateAllRoundQuestions } = require('../services/aiQuestionGenerator.service');
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const forceRegenerate = req.body.forceRegenerate === true;

    const results = await generateAllRoundQuestions(hackathon._id, req.user._id, forceRegenerate);

    // Reload hackathon to get updated questionIds
    const updated = await Hackathon.findById(req.params.id);

    const summary = updated.rounds.map(r => ({
      roundNumber: r.roundNumber,
      questionCount: r.questionIds?.length || 0
    }));

    res.status(200).json({
      success: true,
      message: forceRegenerate
        ? 'Questions regenerated successfully!'
        : 'AI questions generated and assigned.',
      data: {
        summary,
        newQuestions: {
          round1: results.round1.length,
          round2: results.round2.length,
          round3: results.round3.length
        }
      }
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listHackathons,
  getHackathonBySlug,
  getLeaderboard,
  registerForHackathon,
  getMyStatus,
  getRoundQuestions,
  submitRound,
  getResults,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  getParticipants,
  declareWinners,
  exportResults,
  adminListHackathons,
  getCurrentHackathon,
  assignQuestionsToRound,
  removeQuestionFromRound,
  generateAIQuestions,
  startRound
};

