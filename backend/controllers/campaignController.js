import Campaign from '../models/Campaign.js';
import { VERIFICATION_STATUS, LIFECYCLE_STATUS } from '../constants/index.js';
import { generateSlug } from '../utils/generateToken.js';
import {
  updateCampaignLifecycle,
  isPubliclyVisible,
  buildSortQuery,
} from '../utils/campaignLifecycle.js';

const publicFilter = {
  verificationStatus: {
    $in: [VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.EMERGENCY_VERIFIED],
  },
  lifecycleStatus: { $in: [LIFECYCLE_STATUS.ACTIVE, LIFECYCLE_STATUS.GOAL_ACHIEVED] },
};

export const getFeaturedCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ ...publicFilter, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('organizer', 'fullName');

    if (campaigns.length === 0) {
      const fallback = await Campaign.find(publicFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('organizer', 'fullName');
      return res.json(fallback);
    }

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const {
      search,
      category,
      sort = 'latest',
      page = 1,
      limit = 15,
      emergency,
    } = req.query;

    const filter = { ...publicFilter };

    if (emergency === 'true') {
      filter.isEmergency = true;
    } else {
      filter.isEmergency = { $ne: true };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let query = Campaign.find(filter).populate('organizer', 'fullName');

    if (search) {
      const organizerCampaigns = await Campaign.find(publicFilter).populate(
        'organizer',
        'fullName'
      );
      const organizerIds = organizerCampaigns
        .filter((c) => c.organizer?.fullName?.toLowerCase().includes(search.toLowerCase()))
        .map((c) => c._id);

      if (organizerIds.length > 0) {
        filter.$or = [
          ...(filter.$or || []),
          { _id: { $in: organizerIds } },
        ];
        query = Campaign.find(filter).populate('organizer', 'fullName');
      }
    }

    const [campaigns, total] = await Promise.all([
      query.sort(buildSortQuery(sort)).skip(skip).limit(limitNum),
      Campaign.countDocuments(filter),
    ]);

    res.json({
      campaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmergencyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      ...publicFilter,
      isEmergency: true,
    })
      .sort({ urgencyScore: -1, createdAt: -1 })
      .populate('organizer', 'fullName');

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCampaignBySlug = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug }).populate(
      'organizer',
      'fullName email phone isVerifiedFundraiser'
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await updateCampaignLifecycle(campaign);

    const isOwner = req.user && campaign.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isPubliclyVisible(campaign) && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.viewCount += 1;
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const {
      title,
      category,
      thumbnail,
      location,
      shortDescription,
      story,
      fundingGoal,
      purposeOfFunds,
      startDate,
      endDate,
      keywords,
      supportingDocuments,
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);

    if (daysDiff < 7 || daysDiff > 90) {
      return res.status(400).json({
        message: 'Campaign duration must be between 7 and 90 days',
      });
    }

    const campaign = await Campaign.create({
      title,
      slug: generateSlug(title),
      category,
      thumbnail: thumbnail || `https://picsum.photos/seed/${Date.now()}/600/400`,
      location,
      shortDescription,
      story: story || {},
      fundingGoal,
      purposeOfFunds,
      startDate: start,
      endDate: end,
      keywords: keywords || [],
      supportingDocuments: supportingDocuments || [],
      organizer: req.user._id,
      verificationStatus: VERIFICATION_STATUS.PENDING,
      lifecycleStatus: LIFECYCLE_STATUS.ACTIVE,
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const incrementShareCount = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    campaign.shareCount += 1;
    await campaign.save();
    res.json({ shareCount: campaign.shareCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
