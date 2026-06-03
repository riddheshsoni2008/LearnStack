const express = require('express');
const router = express.Router();
const { getMyProgress, getTrackProgress, completeLessonDirect } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/me', protect, getMyProgress);
router.get('/track/:trackId', protect, getTrackProgress);
router.post('/complete/:lessonId', protect, completeLessonDirect);

module.exports = router;
