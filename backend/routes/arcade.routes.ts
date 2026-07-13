import express from 'express';
import { getArcadeHub, submitChallenge, getArcadeLeaderboard, getLevelsByWorld, getLevelById, getDailyMission, submitDailyMission  } from '../controllers/arcade.controller';
import { protect  } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/hub', protect, getArcadeHub);
router.get('/daily', protect, getDailyMission);
router.post('/daily/submit', protect, submitDailyMission);
router.get('/worlds/:worldId', protect, getLevelsByWorld);
router.get('/levels/:levelId', protect, getLevelById);
router.post('/submit', protect, submitChallenge);
router.get('/leaderboard', protect, getArcadeLeaderboard);

export default router;
