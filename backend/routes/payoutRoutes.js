import express from 'express';
import { getManagerPayouts } from '../controllers/payoutController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/:managerId', protect, requireFundraiser, getManagerPayouts);

export default router;
