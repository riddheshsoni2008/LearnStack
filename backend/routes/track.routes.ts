import express from 'express';
import { getTracks, getTrack, getTrackBySlug, createTrack, updateTrack, deleteTrack } from '../controllers/track.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getTracks);
router.get('/slug/:slug', getTrackBySlug);
router.get('/:id', getTrack);
router.post('/', protect, admin, createTrack);
router.put('/:id', protect, admin, updateTrack);
router.delete('/:id', protect, admin, deleteTrack);

export default router;
