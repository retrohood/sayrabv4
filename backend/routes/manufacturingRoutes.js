import express from 'express';
import {
  getProductionQueue,
  updateProductionStatus,
} from '../controllers/manufacturingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

router.use(protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FUNDRAISER));

router.get('/queue', getProductionQueue);
router.put('/orders/:id/status', updateProductionStatus);

export default router;
