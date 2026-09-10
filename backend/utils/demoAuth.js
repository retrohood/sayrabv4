import { USER_ROLES } from '../constants/index.js';

export const DEMO_USER_ID = 'demo-user-local';
export const DEMO_EMAIL = 'demo@sayrab.local';
export const DEMO_PASSWORD = 'password123';

export const isDatabaseConnected = (mongoose) => mongoose.connection.readyState === 1;

export const createDemoUser = ({
  fullName = 'Demo User',
  email = DEMO_EMAIL,
  phone = '',
  role = USER_ROLES.CUSTOMER,
  cnic = '',
  address = '',
} = {}) => {
  const user = {
    _id: DEMO_USER_ID,
    name: fullName,
    fullName,
    email,
    phone,
    role,
    cnic,
    address,
    profilePicture: '',
    notificationPreferences: {
      donationUpdates: true,
      campaignUpdates: true,
      verificationNotifications: true,
      storeNotifications: true,
    },
    isVerifiedFundraiser: role === USER_ROLES.MANAGER || role === USER_ROLES.FUNDRAISER,
    referralCode: 'ref_demo_local',
    referralPrivacy: 'public',
    createdAt: new Date().toISOString(),
  };

  user.toPublicJSON = () => ({
    _id: user._id,
    name: user.name,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    cnic: user.cnic,
    address: user.address,
    profilePicture: user.profilePicture,
    notificationPreferences: user.notificationPreferences,
    isVerifiedFundraiser: user.isVerifiedFundraiser,
    referralCode: user.referralCode,
    referralPrivacy: user.referralPrivacy,
    createdAt: user.createdAt,
  });

  user.save = async () => user;

  return user;
};

export const DEMO_ADMIN_EMAIL = 'admin@sayrab.com';
export const DEMO_ADMIN_PASSWORD = 'password123';

export const isDemoLogin = (email, password) => {
  const normEmail = email?.toLowerCase();
  if (normEmail === DEMO_EMAIL && password === DEMO_PASSWORD) return true;
  if (normEmail === DEMO_ADMIN_EMAIL && (password === DEMO_ADMIN_PASSWORD || password === 'admin123')) return true;
  return false;
};

export const isAdminDemoLogin = (email, password) => {
  const normEmail = email?.toLowerCase();
  return normEmail === DEMO_ADMIN_EMAIL && (password === DEMO_ADMIN_PASSWORD || password === 'admin123');
};
