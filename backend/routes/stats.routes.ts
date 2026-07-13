import express from 'express';
const router = express.Router();
import { getPublicStats  } from '../controllers/stats.controller';

router.get('/', getPublicStats);

export default router;
