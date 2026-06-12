import express from 'express';
import {
  getReferralLink,
  trackReferralClick,
  getReferralLeaderboard,
} from '../controllers/referralController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/link/:campaignId', optionalAuth, getReferralLink);
router.get('/track', trackReferralClick);
router.get('/leaderboard/:campaignId', getReferralLeaderboard);

export default router;
