import express from 'express';
import {
  register,
  registerDonor,
  registerFundraiser,
  login,
  getProfile,
  updateReferralPrivacy,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register/donor', registerDonor);
router.post('/register/fundraiser', registerFundraiser);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getProfile);
router.get('/profile', protect, getProfile);
router.put('/referral-privacy', protect, updateReferralPrivacy);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/notifications', protect, updateNotificationPreferences);

export default router;
