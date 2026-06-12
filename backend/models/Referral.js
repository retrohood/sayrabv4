import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    referralCode: { type: String, required: true },
    clickCount: { type: Number, default: 0 },
    donationCount: { type: Number, default: 0 },
    amountRaised: { type: Number, default: 0 },
  },
  { timestamps: true }
);

referralSchema.index({ user: 1, campaign: 1 }, { unique: true });
referralSchema.index({ referralCode: 1, campaign: 1 });

export default mongoose.model('Referral', referralSchema);
