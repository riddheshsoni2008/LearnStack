const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getAllBadges, getMyBadges, getXpHistory } = require('../controllers/badge.controller');

router.get('/', protect, getAllBadges);
router.get('/me', protect, getMyBadges);
router.get('/xp-history', protect, getXpHistory);

module.exports = router;
