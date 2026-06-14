import express from 'express';
import { getCampaignAnalytics } from '../controllers/analyticsController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/:campaignId', protect, requireFundraiser, getCampaignAnalytics);

export default router;
