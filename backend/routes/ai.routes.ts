import express from 'express';
import { askTeacher  } from '../controllers/ai.controller';
import { protect  } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(protect);

router.post('/ask', askTeacher);

export default router;
