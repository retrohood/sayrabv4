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
  submitForReview,
  getManufacturerQuotations,
  getAllAdminQuotations,
  assignToManufacturer,
  cancelQuotation,
  respondManufacturerProposal,
  startProduction,
  acceptProposal,
  requestRevision,
  getQuotationMessages,
  sendQuotationMessage,
} from '../controllers/quotationController.js';
import { protect, optionalAuth, requireFundraiser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public & Optional Auth Endpoints for the Interactive Pipeline
router.post('/analyze-step1', optionalAuth, analyzeStep1);
router.post('/analyze-step2', optionalAuth, analyzeStep2);
router.post('/gemini-market-quote', optionalAuth, getGeminiMarketQuote);
router.post('/lookup-rate', optionalAuth, lookupRate);
router.post('/calculate-dual', optionalAuth, calculateDualQuotation);

// Authenticated Endpoints for Fundraisers, Manufacturers & Admins
router.get('/samples', optionalAuth, getQuotationSamples);
router.get('/my', protect, getMyQuotations);
router.get('/manufacturer-review', protect, getManufacturerQuotations);
router.get('/admin/all', protect, getAllAdminQuotations);
router.post('/analyze', optionalAuth, analyzeTechPack);
router.post('/calculate', optionalAuth, calculateAndSaveQuotation);
router.get('/:id', optionalAuth, getQuotationById);
router.patch('/:id', optionalAuth, updateQuotation);
router.post('/:id/approve', protect, approveQuotation);
router.post('/:id/submit-review', protect, submitForReview);
router.post('/:id/assign-manufacturer', protect, assignToManufacturer);
router.post('/:id/cancel', protect, cancelQuotation);
router.post('/:id/manufacturer-response', protect, respondManufacturerProposal);
router.post('/:id/accept-proposal', protect, acceptProposal);
router.post('/:id/request-revision', protect, requestRevision);
router.post('/:id/start-production', protect, startProduction);

// Secure Quotation Private Chat
router.get('/:id/messages', protect, getQuotationMessages);
router.post('/:id/messages', protect, sendQuotationMessage);

export default router;
