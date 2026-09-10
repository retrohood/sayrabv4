export const CAMPAIGN_CATEGORIES = [
  'Medical Assistance',
  'Education / Student Fees',
  'Small Business Support',
  'Disaster Relief',
  'Food Distribution',
  'Community Welfare',
  'Animal Welfare',
  'Emergency Assistance',
  'Other',
];

export const VERIFICATION_STATUS = {
  PENDING: 'pending_verification',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EMERGENCY_VERIFIED: 'emergency_verified',
};

export const LIFECYCLE_STATUS = {
  ACTIVE: 'active',
  GOAL_ACHIEVED: 'goal_achieved',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  COMPLETED: 'completed',
};

export const SORT_OPTIONS = {
  LATEST: 'latest',
  OLDEST: 'oldest',
  MOST_FUNDED: 'most_funded',
  LEAST_FUNDED: 'least_funded',
  ENDING_SOON: 'ending_soon',
  MOST_URGENT: 'most_urgent',
  MOST_VIEWED: 'most_viewed',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  DONOR: 'donor',
  FUNDRAISER: 'fundraiser',
  ADMIN: 'admin',
  ORG_LEADER: 'org_leader',
  MEMBER: 'member',
  MANUFACTURER: 'manufacturer',
};

export const CUSTOMER_ROLES = [USER_ROLES.CUSTOMER, USER_ROLES.DONOR];
export const MANAGER_ROLES = [USER_ROLES.MANAGER, USER_ROLES.FUNDRAISER, USER_ROLES.ORG_LEADER];

export const isCustomerRole = (role) => CUSTOMER_ROLES.includes(role);
export const isManagerRole = (role) => MANAGER_ROLES.includes(role);
export const isAdminRole = (role) => role === USER_ROLES.ADMIN;

export const ORGANIZATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export const PAYOUT_STATUS = {
  REQUESTED: 'requested',
  PENDING_REVIEW: 'pending_review',
  SCHEDULED: 'scheduled',
  PROCESSING: 'processing',
  PAID: 'paid',
  REJECTED: 'rejected',
};

export const TECHPACK_STATUS = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION_REQUESTED: 'revision_requested',
  ACCEPTED_BY_MANUFACTURER: 'accepted_by_manufacturer',
  SAMPLE_IN_PROGRESS: 'sample_in_progress',
  SAMPLE_APPROVED: 'sample_approved',
  IN_BULK_PRODUCTION: 'in_bulk_production',
};

export const MANUFACTURER_ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PRODUCTION: 'in_production',
  QUALITY_CHECK: 'quality_check',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  REJECTED: 'rejected',
};

export const CAMPAIGN_STATUSES = [
  'pending',
  'active',
  'completed',
  'cancelled',
  'terminated',
  'paused',
];

export const PRODUCT_CATEGORIES = [
  'Apparel',
  'Drinkware',
  'Stationery',
  'Accessories',
  'Event Merchandise',
];

export const PAYMENT_METHODS = [
  'credit_card',
  'debit_card',
  'qr_code',
  'easypaisa',
  'jazzcash',
  'other_wallet',
];

export const ORDER_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const ORDER_STATUSES = ['placed', 'paid', 'production', 'shipped', 'delivered', 'cancelled', 'refunded'];
export const DESIGN_STATUSES = ['draft', 'generated', 'approved', 'rejected'];
export const PRODUCTION_STATUSES = [
  'waiting',
  'in_production',
  'quality_check',
  'shipped',
  'delivered',
];

export const REVENUE_SPLIT = {
  ORGANIZATION: 0.5,
  SAYRAB: 0.05,
  MANUFACTURER: 0.45,
};

