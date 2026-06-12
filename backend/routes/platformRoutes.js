import express from 'express';
import { getPlatformStats, getAboutContent } from '../controllers/platformController.js';

const router = express.Router();

router.get('/stats', getPlatformStats);
router.get('/about', getAboutContent);

export default router;
