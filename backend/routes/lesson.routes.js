const express = require('express');
const router = express.Router();
const { getLesson, createLesson, updateLesson, deleteLesson } = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.get('/:id', getLesson);
router.post('/', protect, admin, createLesson);
router.put('/:id', protect, admin, updateLesson);
router.delete('/:id', protect, admin, deleteLesson);

module.exports = router;
