import express from 'express';
import {
  analyzeStep1,
  analyzeStep2,
  getGeminiMarketQuote,
  lookupRate,
  calculateDualQuotation,
  analyzeTechPack,
  approveQuotation,
  calculateAndSaveQuotation,
  getMyQuotations,
  getQuotationById,
  getQuotationSamples,
  updateQuotation,
} from '../controllers/quotationController.js';
import { protect, optionalAuth, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

// Public & Optional Auth Endpoints for the Interactive Pipeline
router.post('/analyze-step1', optionalAuth, analyzeStep1);
router.post('/analyze-step2', optionalAuth, analyzeStep2);
router.post('/gemini-market-quote', optionalAuth, getGeminiMarketQuote);
router.post('/lookup-rate', optionalAuth, lookupRate);
router.post('/calculate-dual', optionalAuth, calculateDualQuotation);

// Legacy & Authenticated Endpoints
router.get('/samples', optionalAuth, getQuotationSamples);
router.get('/my', protect, getMyQuotations);
router.post('/analyze', optionalAuth, analyzeTechPack);
router.post('/calculate', optionalAuth, calculateAndSaveQuotation);
router.get('/:id', optionalAuth, getQuotationById);
router.patch('/:id', optionalAuth, updateQuotation);
router.post('/:id/approve', protect, approveQuotation);

export default router;
