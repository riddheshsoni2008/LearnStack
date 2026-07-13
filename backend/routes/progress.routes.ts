import express from 'express';
import { getMyProgress, getTrackProgress, completeLessonDirect } from '../controllers/progress.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', protect, getMyProgress);
router.get('/track/:trackId', protect, getTrackProgress);
router.post('/complete/:lessonId', protect, completeLessonDirect);

export default router;
