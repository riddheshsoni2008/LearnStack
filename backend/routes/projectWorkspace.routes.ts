import express from 'express';
const router = express.Router();
import { protect  } from '../middleware/auth.middleware';
import { createWorkspace,
  saveWorkspace,
  getWorkspace
 } from '../controllers/projectWorkspace.controller';

router.post('/create', protect, createWorkspace);
router.post('/save', protect, saveWorkspace);
router.get('/', protect, getWorkspace);

export default router;
