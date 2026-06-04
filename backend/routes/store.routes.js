const express = require('express');
const { getStoreItems, purchaseItem, openMysteryBox, equipItem } = require('../controllers/store.controller');
const { protect } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/', protect, getStoreItems);
router.post('/purchase', protect, purchaseItem);
router.post('/mystery-box', protect, openMysteryBox);
router.post('/equip', protect, equipItem);

module.exports = router;
