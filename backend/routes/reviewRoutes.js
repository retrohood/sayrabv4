import express from 'express';
import {
  getPublishedReviews,
  getProductReviews,
  submitProductReview,
  getCreatorProductReviews,
} from '../controllers/reviewController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPublishedReviews);
router.get('/product/:productId', getProductReviews);
router.post('/product', protect, submitProductReview);
router.get('/creator/products', protect, requireFundraiser, getCreatorProductReviews);

export default router;
