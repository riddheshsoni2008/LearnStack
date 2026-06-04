const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getLeaderboard, togglePrivacy } = require('../controllers/leaderboard.controller');

router.get('/', protect, getLeaderboard);
router.put('/privacy', protect, togglePrivacy);

module.exports = router;
