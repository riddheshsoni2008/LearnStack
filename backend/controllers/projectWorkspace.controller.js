const ProjectSubmission = require('../models/ProjectSubmission');

const DEFAULT_PROJECT_FILES = [
  {
    path: "src/App.jsx",
    content: `import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div className="app-container">
      <h1>LearnStack Project Workspace</h1>
      <p>Start building your full-stack project here.</p>
    </div>
  );
}`
  },
  {
    path: "src/styles.css",
    content: `body {
  margin: 0;
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}
.app-container {
  padding: 2rem;
  text-align: center;
}`
  },
  {
    path: "backend/server.js",
    content: `const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
  },
  {
    path: "backend/routes.js",
    content: `const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is healthy' });
});

module.exports = router;`
  },
  {
    path: "README.md",
    content: `# Full-Stack Challenge Project

Welcome to the LearnStack Full-Stack Workspace!

## Project Structure
- \`src/\`: React frontend components and styles
- \`backend/\`: Express server logic and route handlers
- \`README.md\`: Project documentation and guidelines`
  }
];

// @desc    Create workspace (initialize default files)
// @route   POST /api/project-workspace/create
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { hackathonId, roundNumber } = req.body;
    const userId = req.user._id;

    if (!hackathonId || !roundNumber) {
      return res.status(400).json({ success: false, message: 'hackathonId and roundNumber are required' });
    }

    let submission = await ProjectSubmission.findOne({
      hackathonId,
      roundNumber: parseInt(roundNumber),
      userId
    });

    if (submission) {
      return res.status(200).json({
        success: true,
        message: 'Workspace already exists',
        data: {
          userId: submission.userId,
          roundId: submission.roundNumber,
          projectFiles: submission.files
        }
      });
    }

    submission = await ProjectSubmission.create({
      hackathonId,
      roundNumber: parseInt(roundNumber),
      userId,
      files: DEFAULT_PROJECT_FILES,
      activeFilePath: 'src/App.jsx',
      openTabs: ['src/App.jsx'],
      status: 'IN_PROGRESS',
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: {
        userId: submission.userId,
        roundId: submission.roundNumber,
        projectFiles: submission.files
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Save workspace state
// @route   POST /api/project-workspace/save
// @access  Private
const saveWorkspace = async (req, res) => {
  try {
    const { hackathonId, roundNumber, projectFiles, activeFilePath, openTabs, status } = req.body;
    const userId = req.user._id;

    if (!hackathonId || !roundNumber) {
      return res.status(400).json({ success: false, message: 'hackathonId and roundNumber are required' });
    }

    let submission = await ProjectSubmission.findOne({
      hackathonId,
      roundNumber: parseInt(roundNumber),
      userId
    });

    if (!submission) {
      submission = new ProjectSubmission({
        hackathonId,
        roundNumber: parseInt(roundNumber),
        userId,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      });
    }

    if (projectFiles && Array.isArray(projectFiles)) {
      submission.files = projectFiles;
    }
    if (activeFilePath !== undefined) {
      submission.activeFilePath = activeFilePath;
    }
    if (openTabs && Array.isArray(openTabs)) {
      submission.openTabs = openTabs;
    }
    if (status) {
      submission.status = status;
    }
    submission.lastSavedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Workspace saved successfully',
      data: {
        userId: submission.userId,
        roundId: submission.roundNumber,
        projectFiles: submission.files
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get workspace state
// @route   GET /api/project-workspace
// @access  Private
const getWorkspace = async (req, res) => {
  try {
    const { hackathonId, roundNumber } = req.query;
    const userId = req.user._id;

    if (!hackathonId || !roundNumber) {
      return res.status(400).json({ success: false, message: 'hackathonId and roundNumber are required' });
    }

    const submission = await ProjectSubmission.findOne({
      hackathonId,
      roundNumber: parseInt(roundNumber),
      userId
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: submission.userId,
        roundId: submission.roundNumber,
        projectFiles: submission.files
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createWorkspace,
  saveWorkspace,
  getWorkspace
};
