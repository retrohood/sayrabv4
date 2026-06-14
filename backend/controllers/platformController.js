import PlatformStats from '../models/PlatformStats.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import { CUSTOMER_ROLES } from '../constants/index.js';

export const getPlatformStats = async (req, res) => {
  try {
    let stats = await PlatformStats.findOne();

    if (!stats) {
      const [totalRaised, campaignCount, donorCount, emergencyCount] = await Promise.all([
        Donation.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Campaign.countDocuments(),
        User.countDocuments({ role: { $in: CUSTOMER_ROLES } }),
        Campaign.countDocuments({ isEmergency: true }),
      ]);

      stats = await PlatformStats.create({
        totalFundsRaised: totalRaised[0]?.total || 0,
        totalCampaignsSupported: campaignCount,
        totalDonors: donorCount,
        emergencyCampaignsFunded: emergencyCount,
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAboutContent = async (req, res) => {
  try {
    const stats = await PlatformStats.findOne();
    res.json({
      mission:
        'Sayrab exists to connect compassionate donors with verified fundraisers, ensuring every contribution creates measurable social impact through transparency and accountability.',
      howItWorks: [
        { step: 1, title: 'Campaign Submission', description: 'Fundraisers submit campaigns with supporting documentation.' },
        { step: 2, title: 'Verification Process', description: 'Our verification team reviews evidence before publication.' },
        { step: 3, title: 'Fundraising', description: 'Verified campaigns receive donations through secure payment channels.' },
        { step: 4, title: 'Fund Distribution', description: 'Funds are distributed to beneficiaries with full accountability.' },
        { step: 5, title: 'Transparency Reporting', description: 'Impact reports and statistics are published for public review.' },
      ],
      coreValues: ['Transparency', 'Accountability', 'Community Support', 'Trust', 'Social Impact'],
      impactStatistics: stats || {
        totalFundsRaised: 0,
        totalCampaignsSupported: 0,
        totalDonors: 0,
        emergencyCampaignsFunded: 0,
      },
      revenueAllocation: stats?.revenueAllocation || {
        emergencyCampaigns: 30,
        disasterResponse: 20,
        platformOperations: 25,
        volunteerSupport: 15,
        communityInitiatives: 10,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
