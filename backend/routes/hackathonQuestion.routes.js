const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImport,
  getQuestionById
} = require('../controllers/hackathonQuestion.controller');

// All routes are admin-only
router.use(protect, admin);

router.get('/', listQuestions);
router.post('/', createQuestion);
router.post('/bulk', bulkImport);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
