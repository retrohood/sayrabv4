import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Order from '../models/Order.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import { USER_ROLES, VERIFICATION_STATUS } from '../constants/index.js';

export const getAdminOverview = async (req, res) => {
  try {
    const [users, campaigns, pendingCampaigns, withdrawals, orders] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments(),
      Campaign.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
      WithdrawalRequest.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
    ]);

    res.json({
      users,
      campaigns,
      pendingCampaigns,
      pendingWithdrawals: withdrawals,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: { $in: [USER_ROLES.MANAGER, USER_ROLES.FUNDRAISER] },
    })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateManagerApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    user.isVerifiedFundraiser = Boolean(req.body.approved);
    if (req.body.role && [USER_ROLES.MANAGER, USER_ROLES.FUNDRAISER].includes(req.body.role)) {
      user.role = req.body.role;
    }
    await user.save();

    res.json(user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listCampaignsForReview = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { verificationStatus: status } : {};
    const campaigns = await Campaign.find(filter)
      .populate('organizer', 'fullName email isVerifiedFundraiser')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewCampaign = async (req, res) => {
  try {
    const { verificationStatus, rejectionReason, isEmergency, isFeatured } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (verificationStatus) {
      campaign.verificationStatus = verificationStatus;
    }
    if (rejectionReason !== undefined) {
      campaign.rejectionReason = rejectionReason;
    }
    if (isEmergency !== undefined) {
      campaign.isEmergency = isEmergency;
    }
    if (isFeatured !== undefined) {
      campaign.isFeatured = isFeatured;
    }

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listPayoutReviews = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({})
      .populate('campaign', 'title organizer amountRaised')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewPayout = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payout status' });
    }

    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    withdrawal.status = status;
    withdrawal.adminNote = adminNote;
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    await withdrawal.save();

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listOrderIssues = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentStatus: 'failed' }, { orderStatus: { $in: ['production', 'shipped'] } }],
    })
      .populate('campaignId', 'title')
      .populate('customerId', 'fullName email')
      .sort({ updatedAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
