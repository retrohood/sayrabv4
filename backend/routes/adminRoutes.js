import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/index.js';
import {
  getAdminOverview,
  listManagers,
  updateManagerApproval,
  listCampaignsForReview,
  reviewCampaign,
  listPayoutReviews,
  reviewPayout,
  listOrderIssues,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, authorize(USER_ROLES.ADMIN));

router.get('/overview', getAdminOverview);
router.get('/managers', listManagers);
router.put('/managers/:id/approval', updateManagerApproval);
router.get('/campaigns', listCampaignsForReview);
router.put('/campaigns/:id/review', reviewCampaign);
router.get('/payouts', listPayoutReviews);
router.put('/payouts/:id/review', reviewPayout);
router.get('/orders/issues', listOrderIssues);

export default router;
