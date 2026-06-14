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
};

export const CUSTOMER_ROLES = [USER_ROLES.CUSTOMER, USER_ROLES.DONOR];
export const MANAGER_ROLES = [USER_ROLES.MANAGER, USER_ROLES.FUNDRAISER];

export const isCustomerRole = (role) => CUSTOMER_ROLES.includes(role);
export const isManagerRole = (role) => MANAGER_ROLES.includes(role);
export const isAdminRole = (role) => role === USER_ROLES.ADMIN;

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
export const ORDER_STATUSES = ['placed', 'paid', 'production', 'shipped', 'delivered'];
export const DESIGN_STATUSES = ['draft', 'generated', 'approved', 'rejected'];
export const PRODUCTION_STATUSES = [
  'queued',
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
