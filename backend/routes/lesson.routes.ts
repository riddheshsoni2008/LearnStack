import express from 'express';
import { getLesson, createLesson, updateLesson, deleteLesson } from '../controllers/lesson.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/:id', getLesson);
router.post('/', protect, admin, createLesson);
router.put('/:id', protect, admin, updateLesson);
router.delete('/:id', protect, admin, deleteLesson);

export default router;
