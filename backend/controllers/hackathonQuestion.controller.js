const HackathonQuestion = require('../models/HackathonQuestion');

// ═══════════════════════════════════════════════════════════════
// ADMIN: Question Bank Controller
// Supports both Global and Hackathon-Specific (Private) questions
// ═══════════════════════════════════════════════════════════════

// @desc    List questions with filters
// @route   GET /api/hackathon-questions
// @access  Admin
const listQuestions = async (req, res) => {
  try {
    const { category, difficulty, questionType, scope, hackathonId, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    if (scope) filter.scope = scope;
    if (hackathonId) filter.hackathonId = hackathonId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await HackathonQuestion.countDocuments(filter);
    const questions = await HackathonQuestion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a question
// @route   POST /api/hackathon-questions
// @access  Admin
const createQuestion = async (req, res) => {
  try {
    const question = await HackathonQuestion.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/hackathon-questions/:id
// @access  Admin
const updateQuestion = async (req, res) => {
  try {
    const question = await HackathonQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/hackathon-questions/:id
// @access  Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await HackathonQuestion.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, message: 'Question deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk import questions
// @route   POST /api/hackathon-questions/bulk
// @access  Admin
const bulkImport = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions provided.' });
    }

    const docs = questions.map(q => ({
      ...q,
      createdBy: req.user._id
    }));

    const created = await HackathonQuestion.insertMany(docs, { ordered: false });
    res.status(201).json({
      success: true,
      message: `${created.length} questions imported.`,
      data: created
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single question by ID
// @route   GET /api/hackathon-questions/:id
// @access  Admin
const getQuestionById = async (req, res) => {
  try {
    const question = await HackathonQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImport,
  getQuestionById
};
