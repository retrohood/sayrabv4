import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
import { generateReceiptNumber } from '../utils/generateToken.js';
import { updateCampaignLifecycle } from '../utils/campaignLifecycle.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';

export const createDonation = async (req, res) => {
  try {
    const {
      campaignId,
      amount,
      paymentMethod,
      isAnonymous,
      donorName,
      donorEmail,
      referralCode,
    } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const campaign = inMemoryDB.campaigns.findOne({ _id: campaignId });
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const donation = inMemoryDB.donations.create({
        campaign: campaignId,
        donor: req.user?._id || 'guest-user',
        donorName: req.user && !isAnonymous ? req.user.fullName : donorName || 'Guest Donor',
        donorEmail: req.user?.email || donorEmail || 'guest@example.com',
        amount: Number(amount),
        paymentMethod,
        isAnonymous: isAnonymous || false,
        isGuest: !req.user,
        referralCode,
        referredBy: null,
        receiptNumber: generateReceiptNumber(),
        status: 'completed',
        transactionId: `TXN-${Date.now()}`,
      });

      campaign.amountRaised += Number(amount);
      campaign.donorCount += 1;

      return res.status(201).json({
        donation,
        message: 'Donation successful. Thank you for your contribution!',
      });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    let referredBy = null;
    if (referralCode) {
      const referral = await Referral.findOne({ referralCode, campaign: campaignId });
      if (referral) {
        referredBy = referral.user;
        referral.donationCount += 1;
        referral.amountRaised += amount;
        await referral.save();
      } else {
        const user = await User.findOne({ referralCode });
        if (user) referredBy = user._id;
      }
    }

    const donation = await Donation.create({
      campaign: campaignId,
      donor: req.user?._id,
      donorName: req.user && !isAnonymous ? req.user.fullName : donorName,
      donorEmail: req.user?.email || donorEmail,
      amount,
      paymentMethod,
      isAnonymous: isAnonymous || false,
      isGuest: !req.user,
      referralCode,
      referredBy,
      receiptNumber: generateReceiptNumber(),
      status: 'completed',
      transactionId: `TXN-${Date.now()}`,
    });

    campaign.amountRaised += amount;
    campaign.donorCount += 1;
    await campaign.save();
    await updateCampaignLifecycle(campaign);

    res.status(201).json({
      donation,
      message: 'Donation successful. Thank you for your contribution!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      const donations = inMemoryDB.donations.find({ donor: req.user._id });
      const resolvedDonations = donations.map(d => {
        const campaignObj = inMemoryDB.campaigns.findOne({ _id: d.campaign });
        return {
          ...d,
          campaign: campaignObj ? { _id: campaignObj._id, title: campaignObj.title, slug: campaignObj.slug, thumbnail: campaignObj.thumbnail } : null
        };
      });
      return res.json(resolvedDonations);
    }

    const donations = await Donation.find({ donor: req.user._id })
      .populate('campaign', 'title slug thumbnail')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonationReceipt = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      const donation = inMemoryDB.donations.find().find(d => d._id === req.params.id);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      const campaignObj = inMemoryDB.campaigns.findOne({ _id: donation.campaign });
      return res.json({
        ...donation,
        campaign: campaignObj ? { _id: campaignObj._id, title: campaignObj.title } : null
      });
    }

    const donation = await Donation.findById(req.params.id).populate(
      'campaign',
      'title organizer'
    );

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (
      donation.donor?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
