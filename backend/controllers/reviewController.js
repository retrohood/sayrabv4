import Review from '../models/Review.js';
import Campaign from '../models/Campaign.js';
import { LIFECYCLE_STATUS } from '../constants/index.js';

export const getPublishedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isPublished: true, type: 'campaign' })
      .populate('author', 'fullName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitCampaignReview = async (req, res) => {
  try {
    const { campaignId, rating, feedback } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the campaign creator can submit a review' });
    }

    const concludedStatuses = [
      LIFECYCLE_STATUS.COMPLETED,
      LIFECYCLE_STATUS.EXPIRED,
      LIFECYCLE_STATUS.GOAL_ACHIEVED,
    ];

    if (!concludedStatuses.includes(campaign.lifecycleStatus)) {
      return res.status(400).json({ message: 'Reviews can only be submitted after campaign concludes' });
    }

    const existing = await Review.findOne({ author: req.user._id, campaign: campaignId });
    if (existing) {
      return res.status(400).json({ message: 'Review already submitted for this campaign' });
    }

    const review = await Review.create({
      author: req.user._id,
      campaign: campaignId,
      campaignName: campaign.title,
      rating,
      feedback,
      isModerated: false,
      isPublished: false,
      type: 'campaign',
    });

    res.status(201).json({
      review,
      message: 'Review submitted and pending moderation',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
