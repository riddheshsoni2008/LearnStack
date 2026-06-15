const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createWorkspace,
  saveWorkspace,
  getWorkspace
} = require('../controllers/projectWorkspace.controller');

router.post('/create', protect, createWorkspace);
router.post('/save', protect, saveWorkspace);
router.get('/', protect, getWorkspace);

module.exports = router;
