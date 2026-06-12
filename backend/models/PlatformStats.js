import mongoose from 'mongoose';

const platformStatsSchema = new mongoose.Schema(
  {
    totalFundsRaised: { type: Number, default: 0 },
    totalCampaignsSupported: { type: Number, default: 0 },
    totalDonors: { type: Number, default: 0 },
    emergencyCampaignsFunded: { type: Number, default: 0 },
    revenueAllocation: {
      emergencyCampaigns: { type: Number, default: 30 },
      disasterResponse: { type: Number, default: 20 },
      platformOperations: { type: Number, default: 25 },
      volunteerSupport: { type: Number, default: 15 },
      communityInitiatives: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('PlatformStats', platformStatsSchema);
