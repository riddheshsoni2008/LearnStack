import express from 'express';
const router = express.Router();
import { protect  } from '../middleware/auth.middleware';
import { admin  } from '../middleware/admin.middleware';
import { listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImport,
  getQuestionById
 } from '../controllers/hackathonQuestion.controller';

// All routes are admin-only
router.use(protect, admin);

router.get('/', listQuestions);
router.post('/', createQuestion);
router.post('/bulk', bulkImport);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
