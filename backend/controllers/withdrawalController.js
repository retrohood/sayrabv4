import mongoose from 'mongoose';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Campaign from '../models/Campaign.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';

export const submitWithdrawal = async (req, res) => {
  try {
    const { campaignId, accountHolderName, bankName, accountNumber, iban, easypaisaNumber, jazzcashNumber } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const campaign = inMemoryDB.campaigns.findOne({ _id: campaignId });
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const existing = inMemoryDB.withdrawals.find().find(w => w.campaign === campaignId);
      if (existing) {
        return res.status(400).json({ message: 'Withdrawal already requested for this campaign' });
      }

      const withdrawal = inMemoryDB.withdrawals.create({
        campaign: campaignId,
        accountHolderName,
        bankName,
        accountNumber,
        iban,
        easypaisaNumber,
        jazzcashNumber,
        amount: campaign.amountRaised,
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

    const existing = await WithdrawalRequest.findOne({ campaign: campaignId });
    if (existing) {
      return res.status(400).json({ message: 'Withdrawal already requested for this campaign' });
    }

    const withdrawal = await WithdrawalRequest.create({
      campaign: campaignId,
      accountHolderName,
      bankName,
      accountNumber,
      iban,
      easypaisaNumber,
      jazzcashNumber,
      amount: campaign.amountRaised,
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
