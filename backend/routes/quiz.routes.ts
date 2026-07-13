import express from 'express';
import { getQuiz, submitQuiz, createQuiz } from '../controllers/quiz.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/:lessonId', protect, getQuiz);
router.post('/:lessonId/submit', protect, submitQuiz);
router.post('/', protect, admin, createQuiz);

export default router;
