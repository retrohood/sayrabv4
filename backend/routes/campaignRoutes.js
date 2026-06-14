import express from 'express';
import {
  getFeaturedCampaigns,
  getCampaigns,
  getEmergencyCampaigns,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getMyCampaigns,
  incrementShareCount,
} from '../controllers/campaignController.js';
import { protect, optionalAuth, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/featured', getFeaturedCampaigns);
router.get('/emergency', getEmergencyCampaigns);
router.get('/', getCampaigns);
router.get('/my', protect, requireFundraiser, getMyCampaigns);
router.get('/:slug', optionalAuth, getCampaignBySlug);
router.post('/', protect, requireFundraiser, createCampaign);
router.put('/:id', protect, requireFundraiser, updateCampaign);
router.delete('/:id', protect, requireFundraiser, deleteCampaign);
router.post('/:id/share', incrementShareCount);

export default router;
