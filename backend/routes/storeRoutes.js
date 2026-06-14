import express from 'express';
import { openStore, getMyStore } from '../controllers/storeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, openStore);
router.get('/my', protect, getMyStore);

export default router;
