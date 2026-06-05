const express = require('express');
const { askTeacher } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(protect);

router.post('/ask', askTeacher);

module.exports = router;
