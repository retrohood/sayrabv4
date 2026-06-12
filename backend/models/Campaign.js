import mongoose from 'mongoose';
import { CAMPAIGN_CATEGORIES, VERIFICATION_STATUS, LIFECYCLE_STATUS } from '../constants/index.js';

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    keywords: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: CAMPAIGN_CATEGORIES,
      required: true,
    },
    thumbnail: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    story: {
      background: { type: String, default: '' },
      currentSituation: { type: String, default: '' },
      fundingNeed: { type: String, default: '' },
      expectedImpact: { type: String, default: '' },
      supportingEvidence: { type: String, default: '' },
    },
    fundingGoal: { type: Number, required: true, min: 1 },
    amountRaised: { type: Number, default: 0, min: 0 },
    purposeOfFunds: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    lifecycleStatus: {
      type: String,
      enum: Object.values(LIFECYCLE_STATUS),
      default: LIFECYCLE_STATUS.ACTIVE,
    },
    isEmergency: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    donorCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    urgencyScore: { type: Number, default: 0 },
    supportingDocuments: [
      {
        type: { type: String },
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

campaignSchema.index({ title: 'text', keywords: 'text', shortDescription: 'text' });
campaignSchema.index({ category: 1, lifecycleStatus: 1, verificationStatus: 1 });
campaignSchema.index({ endDate: 1 });

campaignSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

campaignSchema.virtual('percentFunded').get(function () {
  if (!this.fundingGoal) return 0;
  return Math.min(100, Math.round((this.amountRaised / this.fundingGoal) * 100));
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

export default mongoose.model('Campaign', campaignSchema);
