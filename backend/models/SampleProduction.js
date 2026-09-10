import mongoose from 'mongoose';

const sampleProductionSchema = new mongoose.Schema(
  {
    techpack: { type: mongoose.Schema.Types.ObjectId, ref: 'Techpack', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
    status: {
      type: String,
      enum: ['pending', 'sample_in_production', 'sample_completed', 'sample_shipped', 'approved_by_leader', 'rejected_by_leader'],
      default: 'pending',
    },
    samplePhotos: [
      {
        url: { type: String },
        caption: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    courier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    leaderFeedback: { type: String, default: '' },
    completedAt: { type: Date },
    shippedAt: { type: Date },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

sampleProductionSchema.index({ manufacturer: 1, status: 1 });

export default mongoose.model('SampleProduction', sampleProductionSchema);
