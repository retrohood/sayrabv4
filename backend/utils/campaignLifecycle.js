import Campaign from '../models/Campaign.js';
import { LIFECYCLE_STATUS, VERIFICATION_STATUS } from '../constants/index.js';

export const updateCampaignLifecycle = async (campaign) => {
  const now = new Date();
  let changed = false;

  if (campaign.lifecycleStatus === LIFECYCLE_STATUS.SUSPENDED) {
    return campaign;
  }

  if (
    campaign.amountRaised >= campaign.fundingGoal &&
    campaign.lifecycleStatus === LIFECYCLE_STATUS.ACTIVE
  ) {
    campaign.lifecycleStatus = LIFECYCLE_STATUS.GOAL_ACHIEVED;
    changed = true;
  }

  if (
    new Date(campaign.endDate) < now &&
    [LIFECYCLE_STATUS.ACTIVE, LIFECYCLE_STATUS.GOAL_ACHIEVED].includes(campaign.lifecycleStatus)
  ) {
    campaign.lifecycleStatus = LIFECYCLE_STATUS.EXPIRED;
    changed = true;
  }

  if (changed) {
    await campaign.save();
  }
  return campaign;
};

export const isPubliclyVisible = (campaign) => {
  // Make campaigns publicly visible as long as they are in an active lifecycle state.
  const activeStatuses = [LIFECYCLE_STATUS.ACTIVE, LIFECYCLE_STATUS.GOAL_ACHIEVED];
  return activeStatuses.includes(campaign.lifecycleStatus);
};

export const buildSortQuery = (sort) => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'most_funded':
      return { amountRaised: -1 };
    case 'least_funded':
      return { amountRaised: 1 };
    case 'ending_soon':
      return { endDate: 1 };
    case 'most_urgent':
      return { urgencyScore: -1, endDate: 1 };
    case 'most_viewed':
      return { viewCount: -1 };
    case 'latest':
    default:
      return { createdAt: -1 };
  }
};
