import Campaign from '../models/Campaign.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';

const splitRevenue = (amount) => ({
  organization: Number((amount * 0.5).toFixed(2)),
  sayrab: Number((amount * 0.05).toFixed(2)),
  manufacturer: Number((amount * 0.45).toFixed(2)),
});

export const getManagerPayouts = async (req, res) => {
  try {
    const managerId = req.params.managerId;
    const isSelf = managerId === req.user._id.toString();

    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const campaigns = await Campaign.find({
      $or: [{ organizer: managerId }, { managerId }],
    }).select('title amountRaised raisedAmount fundingGoal');

    const campaignIds = campaigns.map((campaign) => campaign._id);
    const withdrawals = await WithdrawalRequest.find({ campaign: { $in: campaignIds } })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });

    const totalRaised = campaigns.reduce(
      (sum, campaign) => sum + (campaign.amountRaised || campaign.raisedAmount || 0),
      0
    );
    const requested = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    res.json({
      managerId,
      totalRaised,
      requested,
      available: Math.max(0, totalRaised - requested),
      split: splitRevenue(totalRaised),
      campaigns,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
