import express from 'express';
import {
  getProducts,
  getProductBySlug,
<<<<<<< Updated upstream
  getProductsByCampaign,
  getProductById,
=======
>>>>>>> Stashed changes
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, requireFundraiser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
<<<<<<< Updated upstream
router.get('/campaign/:campaignId', getProductsByCampaign);
router.get('/item/:id', getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', protect, requireFundraiser, createProduct);
=======
router.post('/', protect, requireFundraiser, createProduct);
router.get('/:slug', getProductBySlug);
>>>>>>> Stashed changes
router.put('/:id', protect, requireFundraiser, updateProduct);
router.delete('/:id', protect, requireFundraiser, deleteProduct);

export default router;
