import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductsByCampaign,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/campaign/:campaignId', getProductsByCampaign);
router.get('/item/:id', getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', protect, requireFundraiser, createProduct);
router.put('/:id', protect, requireFundraiser, updateProduct);
router.delete('/:id', protect, requireFundraiser, deleteProduct);

export default router;
