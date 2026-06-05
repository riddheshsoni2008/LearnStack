const express = require('express');
const { getArcadeHub, submitChallenge, getArcadeLeaderboard } = require('../controllers/arcade.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/hub', protect, getArcadeHub);
router.post('/submit', protect, submitChallenge);
router.get('/leaderboard', protect, getArcadeLeaderboard);

module.exports = router;
