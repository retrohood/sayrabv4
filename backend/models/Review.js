import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    campaignName: { type: String },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, maxlength: 2000 },
    verifiedBuyer: { type: Boolean, default: true },
    isModerated: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    type: { type: String, enum: ['campaign', 'product'], default: 'campaign' },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
