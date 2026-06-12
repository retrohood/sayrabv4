import express from 'express';
import {
  createDonation,
  getMyDonations,
  getDonationReceipt,
} from '../controllers/donationController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createDonation);
router.get('/my', protect, getMyDonations);
router.get('/:id/receipt', protect, getDonationReceipt);

export default router;
