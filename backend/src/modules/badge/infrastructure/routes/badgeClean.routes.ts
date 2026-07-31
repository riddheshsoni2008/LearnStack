import express from 'express';
import { protect } from '../../../../../middleware/auth.middleware';
import { MongooseBadgeRepository } from '../../interface-adapters/repositories/MongooseBadgeRepository';
import { GetAllBadgesUseCase } from '../../application/use-cases/GetAllBadgesUseCase';
import { GetMyBadgesUseCase } from '../../application/use-cases/GetMyBadgesUseCase';
import { BadgeCleanController } from '../../interface-adapters/controllers/BadgeCleanController';

const router = express.Router();

// 1. Instantiate Repository (Adapter)
const badgeRepository = new MongooseBadgeRepository();

// 2. Instantiate Use Cases (Application)
const getAllBadgesUseCase = new GetAllBadgesUseCase(badgeRepository);
const getMyBadgesUseCase = new GetMyBadgesUseCase(badgeRepository);

// 3. Instantiate Controller (Adapter)
const badgeController = new BadgeCleanController(getAllBadgesUseCase, getMyBadgesUseCase);

// 4. Wire Routes (Infrastructure)
router.get('/', protect, (req, res) => badgeController.getAllBadges(req, res));
router.get('/me', protect, (req, res) => badgeController.getMyBadges(req, res));

export default router;
