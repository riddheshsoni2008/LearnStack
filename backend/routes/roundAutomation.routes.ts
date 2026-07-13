import express from 'express';
const router = express.Router();
import { startRound2,
  getMyChallenge,
  submitRound,
  evaluateRound2,
  getLeaderboard,
  selectTop20,
  autoSaveRound,
  getRoundSubmissions
 } from '../controllers/roundAutomation.controller';

// ── Auth Middleware ──
import { protect  } from '../middleware/auth.middleware';

// ── Participant Routes ──
router.get('/challenges/my-challenge', protect, getMyChallenge);
router.post('/submissions/submit', protect, submitRound);
router.post('/rounds/auto-save', protect, autoSaveRound);

// ── Admin / Automation Routes ──
router.post('/rounds/start-round-2', protect, startRound2);
router.post('/rounds/evaluate', protect, evaluateRound2);
router.post('/rounds/select-top-20', protect, selectTop20);
router.get('/rounds/admin/submissions', protect, getRoundSubmissions);

// ── Public Routes ──
router.get('/leaderboard', getLeaderboard);

export default router;
