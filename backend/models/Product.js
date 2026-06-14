import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES } from '../constants/index.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    branding: { type: String, enum: ['platform', 'campaign'], default: 'platform' },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
