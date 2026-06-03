const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, createQuiz } = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.get('/:lessonId', protect, getQuiz);
router.post('/:lessonId/submit', protect, submitQuiz);
router.post('/', protect, admin, createQuiz);

module.exports = router;
