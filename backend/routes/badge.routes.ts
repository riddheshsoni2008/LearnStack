import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getAllBadges, getMyBadges, getXpHistory } from '../controllers/badge.controller';

const router = express.Router();

router.get('/', protect, getAllBadges);
router.get('/me', protect, getMyBadges);
router.get('/xp-history', protect, getXpHistory);

export default router;
