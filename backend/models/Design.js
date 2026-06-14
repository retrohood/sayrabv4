import mongoose from 'mongoose';
import { DESIGN_STATUSES } from '../constants/index.js';

const designSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    prompt: { type: String, required: true, trim: true },
    generatedImages: [{ type: String }],
    approved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: DESIGN_STATUSES,
      default: 'draft',
    },
    approvedImage: { type: String, trim: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

designSchema.index({ campaignId: 1, createdAt: -1 });
designSchema.index({ approved: 1 });

export default mongoose.model('Design', designSchema);
