import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getLeaderboard, togglePrivacy } from '../controllers/leaderboard.controller';

const router = express.Router();

router.get('/', protect, getLeaderboard);
router.put('/privacy', protect, togglePrivacy);

export default router;
