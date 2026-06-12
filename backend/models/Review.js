import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    campaignName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, maxlength: 2000 },
    isModerated: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    type: { type: String, enum: ['campaign', 'product'], default: 'campaign' },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
