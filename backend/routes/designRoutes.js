import express from 'express';
import {
  generateDesign,
  approveDesign,
  getCampaignDesigns,
} from '../controllers/designController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, requireFundraiser, generateDesign);
router.post('/approve', protect, requireFundraiser, approveDesign);
router.get('/campaign/:campaignId', protect, requireFundraiser, getCampaignDesigns);

export default router;
