const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const {
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
} = require('../controllers/hackathon.controller');

// ── Public Routes ──
router.get('/', listHackathons);
router.get('/current', getCurrentHackathon);
router.get('/:slug/leaderboard', getLeaderboard);

// ── Admin Routes (must come before :slug to avoid conflict) ──
router.get('/admin/all', protect, admin, adminListHackathons);
router.post('/', protect, admin, createHackathon);
router.put('/:id', protect, admin, updateHackathon);
router.delete('/:id', protect, admin, deleteHackathon);
router.get('/:id/participants', protect, admin, getParticipants);
router.post('/:id/declare-winners', protect, admin, declareWinners);
router.get('/:id/export', protect, admin, exportResults);
router.post('/:id/rounds/:roundNumber/questions', protect, admin, assignQuestionsToRound);
router.delete('/:id/rounds/:roundNumber/questions/:questionId', protect, admin, removeQuestionFromRound);
router.post('/:id/generate-questions', protect, admin, generateAIQuestions);

// ── Authenticated Routes ──
router.get('/:slug/details', getHackathonBySlug);
router.post('/:slug/register', protect, registerForHackathon);
router.get('/:slug/my-status', protect, getMyStatus);
router.get('/:slug/rounds/:roundNumber', protect, getRoundQuestions);
router.post('/:slug/rounds/:roundNumber/start', protect, startRound);
router.post('/:slug/rounds/:roundNumber/submit', protect, submitRound);
router.get('/:slug/results', protect, getResults);

module.exports = router;
