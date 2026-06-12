import express from 'express';
import { getPublishedReviews, submitCampaignReview } from '../controllers/reviewController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPublishedReviews);
router.post('/campaign', protect, requireFundraiser, submitCampaignReview);

export default router;
