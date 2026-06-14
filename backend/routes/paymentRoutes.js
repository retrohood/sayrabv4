import express from 'express';
import { createPaymentSession, handleStripeWebhook } from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-session', optionalAuth, createPaymentSession);
router.post('/webhook/stripe', handleStripeWebhook);

export default router;
