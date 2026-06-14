import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderPayment,
} from '../controllers/orderController.js';
import { optionalAuth, protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.put('/:id/payment', protect, authorize(USER_ROLES.ADMIN), updateOrderPayment);
router.get('/:id', optionalAuth, getOrderById);

export default router;
