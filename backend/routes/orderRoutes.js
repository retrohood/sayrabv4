import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getFundraiserOrders,
  updateOrderPayment,
  getOrdersByCampaign,
} from '../controllers/orderController.js';
import { optionalAuth, protect, authorize, requireFundraiser } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/fundraiser', protect, requireFundraiser, getFundraiserOrders);
router.get('/campaign/:campaignId', protect, getOrdersByCampaign);
router.put('/:id/payment', protect, authorize(USER_ROLES.ADMIN), updateOrderPayment);
router.get('/:id', optionalAuth, getOrderById);

export default router;
