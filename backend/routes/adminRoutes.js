import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

router.use(protect, authorize(USER_ROLES.ADMIN));

router.get('/placeholder', (req, res) => {
  res.json({
    message: 'Admin module placeholder — implement campaign verification, emergency management, and moderation here.',
    plannedFeatures: [
      'Campaign verification workflow (pending → under review → verified/rejected)',
      'Emergency campaign management',
      'Review moderation',
      'User management',
      'Platform statistics dashboard',
      'Revenue allocation configuration',
    ],
  });
});

export default router;
