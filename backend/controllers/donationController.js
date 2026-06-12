import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
import { generateReceiptNumber } from '../utils/generateToken.js';
import { updateCampaignLifecycle } from '../utils/campaignLifecycle.js';

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
