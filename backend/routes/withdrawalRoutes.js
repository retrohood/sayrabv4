import express from 'express';
import { submitWithdrawal, getMyWithdrawals } from '../controllers/withdrawalController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, requireFundraiser, submitWithdrawal);
router.get('/my', protect, requireFundraiser, getMyWithdrawals);

export default router;
