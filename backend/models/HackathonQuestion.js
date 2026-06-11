const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// Hackathon Question Bank Schema
// Supports both Global and Hackathon-Specific (Private) questions
// ═══════════════════════════════════════════════════════════════

const HackathonQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['mcq', 'coding', 'case_study', 'scenario', 'project'],
    required: [true, 'Question type is required'],
    index: true
  },
  category: {
    type: String,
    enum: [
      'web_dev', 'frontend', 'backend', 'database', 'sql',
      'ai_ml', 'cybersecurity', 'cloud_computing',
      'problem_solving', 'logical_reasoning', 'system_design'
    ],
    required: [true, 'Category is required'],
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'intermediate', 'advanced'],
    required: [true, 'Difficulty is required'],
    index: true
  },

  // ── MCQ Options ──
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],

  // ── Coding Question Fields ──
  correctAnswer: { type: String, default: '' },
  codeTemplate: { type: String, default: '' },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],

  // ── Explanation (shown after submission) ──
  explanation: { type: String, default: '' },

  // ── Scoring ──
  points: { type: Number, default: 10, min: 1 },
  timeLimit: { type: Number, default: 0 }, // seconds, 0 = use round timer

  // ── Scope: Global vs Private ──
  scope: {
    type: String,
    enum: ['global', 'private'],
    default: 'global'
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    default: null // null = global question
  },

  // ── Tags & Meta ──
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// ── Indexes ──
HackathonQuestionSchema.index({ scope: 1, hackathonId: 1 });
HackathonQuestionSchema.index({ category: 1, difficulty: 1, questionType: 1 });
HackathonQuestionSchema.index({ isActive: 1 });

module.exports = mongoose.model('HackathonQuestion', HackathonQuestionSchema);
