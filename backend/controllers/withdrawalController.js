import mongoose from 'mongoose';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Campaign from '../models/Campaign.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';
import { LIFECYCLE_STATUS, VERIFICATION_STATUS } from '../constants/index.js';

export const submitWithdrawal = async (req, res) => {
  try {
    const { campaignId, accountHolderName, bankName, accountNumber, iban, easypaisaNumber, jazzcashNumber } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const campaign = inMemoryDB.campaigns.findOne({ _id: campaignId });
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // 1. Dual Condition: Verification Check
      const isApproved = ['verified', 'emergency_verified'].includes(campaign.verificationStatus);
      if (!isApproved) {
        return res.status(403).json({
          message: 'Withdrawal restricted: Campaign must be verified by platform administration before funds can be withdrawn.'
        });
      }

      // 2. Dual Condition: Completion Check
      const now = new Date();
      const isCompleted =
        [LIFECYCLE_STATUS.GOAL_ACHIEVED, LIFECYCLE_STATUS.EXPIRED, LIFECYCLE_STATUS.COMPLETED].includes(campaign.lifecycleStatus) ||
        campaign.status === 'completed' ||
        (campaign.amountRaised >= campaign.fundingGoal && campaign.fundingGoal > 0) ||
        (campaign.endDate && new Date(campaign.endDate) < now);
      if (!isCompleted) {
        return res.status(400).json({
          message: 'Withdrawal restricted: Campaign is currently active. Funds can only be withdrawn once the campaign reaches its goal or completion deadline.'
        });
      }

      const existing = inMemoryDB.withdrawals.find().find(w => w.campaign === campaignId && w.status !== 'rejected');
      if (existing) {
        return res.status(400).json({ message: 'A withdrawal request is already pending or approved for this campaign' });
      }

      const withdrawal = inMemoryDB.withdrawals.create({
        campaign: campaignId,
        accountHolderName,
        bankName,
        accountNumber,
        iban,
        easypaisaNumber,
        jazzcashNumber,
        amount: Number(campaign.amountRaised) || 0,
      });

      return res.status(201).json(withdrawal);
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 1. Dual Condition: Verification Check
    const isApproved = ['verified', 'emergency_verified'].includes(campaign.verificationStatus);
    if (!isApproved) {
      return res.status(403).json({
        message: 'Withdrawal restricted: Campaign must be verified by platform administration before funds can be withdrawn.'
      });
    }

    // 2. Dual Condition: Completion Check
    const now = new Date();
    const isCompleted =
      [LIFECYCLE_STATUS.GOAL_ACHIEVED, LIFECYCLE_STATUS.EXPIRED, LIFECYCLE_STATUS.COMPLETED].includes(campaign.lifecycleStatus) ||
      campaign.status === 'completed' ||
      (campaign.amountRaised >= campaign.fundingGoal && campaign.fundingGoal > 0) ||
      (campaign.endDate && new Date(campaign.endDate) < now);
    if (!isCompleted) {
      return res.status(400).json({
        message: 'Withdrawal restricted: Campaign is currently active. Funds can only be withdrawn once the campaign reaches its goal or completion deadline.'
      });
    }

    const existing = await WithdrawalRequest.findOne({ campaign: campaignId, status: { $ne: 'rejected' } });
    if (existing) {
      return res.status(400).json({ message: 'A withdrawal request is already pending or approved for this campaign' });
    }

    const withdrawal = await WithdrawalRequest.create({
      campaign: campaignId,
      accountHolderName,
      bankName,
      accountNumber,
      iban,
      easypaisaNumber,
      jazzcashNumber,
      amount: Number(campaign.amountRaised) || 0,
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyWithdrawals = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      const withdrawals = inMemoryDB.withdrawals.find();
      // map campaign references
      const resolvedWithdrawals = withdrawals.map(w => {
        const campaignObj = inMemoryDB.campaigns.findOne({ _id: w.campaign });
        return {
          ...w,
          campaign: campaignObj ? { _id: campaignObj._id, title: campaignObj.title, amountRaised: campaignObj.amountRaised } : null
        };
      });
      return res.json(resolvedWithdrawals);
    }

    const campaigns = await Campaign.find({ organizer: req.user._id }).select('_id');
    const ids = campaigns.map((c) => c._id);
    const withdrawals = await WithdrawalRequest.find({ campaign: { $in: ids } })
      .populate('campaign', 'title amountRaised')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
