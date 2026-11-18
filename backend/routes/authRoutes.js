import express from 'express';
import {
  register,
  registerDonor,
  registerFundraiser,
  registerManufacturer,
  registerAdmin,
  login,
  getProfile,
  updateReferralPrivacy,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  upgradeToFundraiser,
  startGoogleAuth,
  handleGoogleCallback,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register/donor', registerDonor);
router.post('/register/fundraiser', registerFundraiser);
router.post('/register/manufacturer', registerManufacturer);
router.post('/register/admin', registerAdmin);
router.post('/register', register);
router.post('/login', login);
router.get('/google', startGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.get('/me', protect, getProfile);
router.get('/profile', protect, getProfile);
router.put('/referral-privacy', protect, updateReferralPrivacy);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/notifications', protect, updateNotificationPreferences);
router.put('/upgrade', protect, upgradeToFundraiser);

// Saved Delivery Addresses Endpoints
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

export default router;
