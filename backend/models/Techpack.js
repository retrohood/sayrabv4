import mongoose from 'mongoose';
import { TECHPACK_STATUS } from '../constants/index.js';

const techpackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    designer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    version: { type: String, default: '1.0' },
    files: [
      {
        name: { type: String },
        url: { type: String },
        fileType: { type: String, default: 'application/pdf' },
        size: { type: Number },
      },
    ],
    previewImages: [{ type: String }],
    measurements: { type: mongoose.Schema.Types.Mixed, default: {} },
    materials: [{ type: String }],
    status: {
      type: String,
      enum: Object.values(TECHPACK_STATUS),
      default: TECHPACK_STATUS.PENDING_REVIEW,
    },
    assignedManufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
    adminNotes: { type: String, default: '' },
    revisionNotes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

techpackSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Techpack', techpackSchema);
