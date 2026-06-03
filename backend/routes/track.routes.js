const express = require('express');
const router = express.Router();
const { getTracks, getTrack, createTrack, updateTrack, deleteTrack } = require('../controllers/track.controller');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.get('/', getTracks);
router.get('/:id', getTrack);
router.post('/', protect, admin, createTrack);
router.put('/:id', protect, admin, updateTrack);
router.delete('/:id', protect, admin, deleteTrack);

module.exports = router;
