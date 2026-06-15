const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// Project Workspace Submission Schema - Multi-File Round Submissions
// ═══════════════════════════════════════════════════════════════

const ProjectFileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  }
}, { _id: false });

const ProjectSubmissionSchema = new mongoose.Schema({
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
    index: true
  },
  roundNumber: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Multi-file workspace array of files
  files: [ProjectFileSchema],

  // Workspace layout/tab states saved for returning users
  activeFilePath: {
    type: String,
    default: ''
  },
  openTabs: [{
    type: String
  }],

  // Status lifecycle
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED'],
    default: 'NOT_STARTED',
    index: true
  },

  startedAt: { type: Date },
  submittedAt: { type: Date },
  lastSavedAt: { type: Date },

  // Automatic Evaluation Scores (e.g. for Round 2 automated execution)
  evalScores: {
    functionality: { type: Number, default: 0 },
    codeQuality: { type: Number, default: 0 },
    uiUx: { type: Number, default: 0 },
    databaseDesign: { type: Number, default: 0 },
    scalability: { type: Number, default: 0 }
  },

  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Enforce unique submissions per user, round, and hackathon
ProjectSubmissionSchema.index(
  { hackathonId: 1, userId: 1, roundNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model('ProjectSubmission', ProjectSubmissionSchema);
