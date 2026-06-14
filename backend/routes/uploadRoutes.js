import express from 'express';
import { createUpload, getMyUploads, deleteUpload } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createUpload);
router.get('/', protect, getMyUploads);
router.delete('/:id', protect, deleteUpload);

export default router;
