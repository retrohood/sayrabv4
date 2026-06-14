import mongoose from 'mongoose';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/index.js';
import { generateAuthToken, generateDemoAuthToken, generateReferralCode } from '../utils/generateToken.js';
import { createDemoUser, isDatabaseConnected, isDemoLogin } from '../utils/demoAuth.js';

const handleAuthError = (res, error) => {
  const databaseUnavailable =
    error.name === 'MongooseServerSelectionError' ||
    error.message.includes('buffering timed out') ||
    error.message.includes('before initial connection is complete') ||
    error.message.includes('ECONNREFUSED');

  if (databaseUnavailable) {
    return res.status(503).json({
      message: 'Database is not connected. Please start MongoDB and try again.',
    });
  }

  return res.status(500).json({ message: error.message });
};

export const register = async (req, res) => {
  const requestedRole = req.body.role;

  if (requestedRole === USER_ROLES.MANAGER || requestedRole === USER_ROLES.FUNDRAISER) {
    return registerFundraiser(req, res);
  }

  return registerDonor(req, res);
};

export const registerDonor = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const user = createDemoUser({ fullName, email, phone, role: USER_ROLES.CUSTOMER });
      return res.status(201).json({
        token: generateDemoAuthToken(user),
        user: user.toPublicJSON(),
        demoMode: true,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      name: fullName,
      role: USER_ROLES.CUSTOMER,
      referralCode: generateReferralCode(email),
    });

    res.status(201).json({
      token: generateAuthToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    handleAuthError(res, error);
  }
};

export const registerFundraiser = async (req, res) => {
  try {
    const { fullName, email, password, phone, cnic, address } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const user = createDemoUser({
        fullName,
        email,
        phone,
        cnic,
        address,
        role: USER_ROLES.MANAGER,
      });
      return res.status(201).json({
        token: generateDemoAuthToken(user),
        user: user.toPublicJSON(),
        demoMode: true,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      cnic,
      address,
      name: fullName,
      role: USER_ROLES.MANAGER,
      referralCode: generateReferralCode(email),
    });

    res.status(201).json({
      token: generateAuthToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    handleAuthError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      if (!isDemoLogin(email, password)) {
        return res.status(401).json({
          message: 'Use demo@sayrab.local / password123 until MongoDB is connected.',
        });
      }

      const user = createDemoUser();
      return res.json({
        token: generateDemoAuthToken(user),
        user: user.toPublicJSON(),
        demoMode: true,
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateAuthToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    handleAuthError(res, error);
  }
};

export const getProfile = async (req, res) => {
  res.json(req.user.toPublicJSON());
};

export const updateReferralPrivacy = async (req, res) => {
  try {
    const { referralPrivacy } = req.body;
    if (!['public', 'anonymous'].includes(referralPrivacy)) {
      return res.status(400).json({ message: 'Invalid privacy setting' });
    }
    req.user.referralPrivacy = referralPrivacy;
    await req.user.save();
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, profilePicture } = req.body;
    if (fullName) req.user.fullName = fullName;
    if (phone) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    if (profilePicture !== undefined) req.user.profilePicture = profilePicture;
    await req.user.save();
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { donationUpdates, campaignUpdates, verificationNotifications, storeNotifications } = req.body;
    req.user.notificationPreferences = {
      donationUpdates: donationUpdates ?? req.user.notificationPreferences?.donationUpdates ?? true,
      campaignUpdates: campaignUpdates ?? req.user.notificationPreferences?.campaignUpdates ?? true,
      verificationNotifications: verificationNotifications ?? req.user.notificationPreferences?.verificationNotifications ?? true,
      storeNotifications: storeNotifications ?? req.user.notificationPreferences?.storeNotifications ?? true,
    };
    await req.user.save();
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
