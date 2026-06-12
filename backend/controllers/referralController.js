import Referral from '../models/Referral.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import { generateReferralCode } from '../utils/generateToken.js';

export const getReferralLink = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const campaignPath = `/campaigns/${campaign.slug}`;

    if (!req.user) {
      return res.json({
        link: `${baseUrl}${campaignPath}`,
        isTracked: false,
      });
    }

    let referral = await Referral.findOne({ user: req.user._id, campaign: campaignId });

    if (!referral) {
      const code = req.user.referralCode || generateReferralCode(req.user._id);
      referral = await Referral.create({
        user: req.user._id,
        campaign: campaignId,
        referralCode: `${code}_${campaign.slug}`,
      });
    }

    res.json({
      link: `${baseUrl}${campaignPath}?ref=${referral.referralCode}`,
      referralCode: referral.referralCode,
      isTracked: true,
      stats: {
        clickCount: referral.clickCount,
        donationCount: referral.donationCount,
        amountRaised: referral.amountRaised,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackReferralClick = async (req, res) => {
  try {
    const { ref, campaignSlug } = req.query;

    if (!ref) {
      return res.json({ tracked: false });
    }

    const campaign = await Campaign.findOne({ slug: campaignSlug });
    if (!campaign) {
      return res.json({ tracked: false });
    }

    const referral = await Referral.findOne({ referralCode: ref, campaign: campaign._id });
    if (referral) {
      referral.clickCount += 1;
      await referral.save();
      return res.json({ tracked: true });
    }

    res.json({ tracked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReferralLeaderboard = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const referrals = await Referral.find({ campaign: campaignId })
      .populate('user', 'fullName referralPrivacy')
      .sort({ amountRaised: -1, donationCount: -1 })
      .limit(20);

    const leaderboard = referrals.map((r, index) => ({
      rank: index + 1,
      name:
        r.user?.referralPrivacy === 'anonymous'
          ? 'Anonymous Promoter'
          : r.user?.fullName || 'Unknown',
      donationCount: r.donationCount,
      amountRaised: r.amountRaised,
      clickCount: r.clickCount,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
