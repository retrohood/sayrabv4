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

const getClientRedirectUrl = (redirectPath = '/dashboard') => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const safeRedirect = redirectPath.startsWith('/') && !redirectPath.startsWith('//') ? redirectPath : '/dashboard';
  return new URL(safeRedirect, clientUrl).toString();
};

const encodeGoogleState = ({ redirect, role }) =>
  Buffer.from(JSON.stringify({ redirect: redirect || '/dashboard', role: role || USER_ROLES.CUSTOMER })).toString('base64url');

const decodeGoogleState = (state) => {
  try {
    return JSON.parse(Buffer.from(state || '', 'base64url').toString('utf8'));
  } catch {
    return { redirect: '/dashboard', role: USER_ROLES.CUSTOMER };
  }
};

const buildGoogleRedirectUri = () =>
  process.env.GOOGLE_CALLBACK_URL ||
  `${process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`;

const buildGoogleAuthUrl = ({ redirect, role }) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: buildGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: encodeGoogleState({ redirect, role }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const exchangeGoogleCode = async (code) => {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: buildGoogleRedirectUri(),
    grant_type: 'authorization_code',
  });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || tokenData.error || 'Google token exchange failed');
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = await profileResponse.json();
  if (!profileResponse.ok) {
    throw new Error(profile.error_description || profile.error || 'Google profile lookup failed');
  }

  return profile;
};

export const startGoogleAuth = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ message: 'Google auth is not configured on the server.' });
  }

  const role = req.query.role === USER_ROLES.FUNDRAISER || req.query.role === USER_ROLES.MANAGER
    ? USER_ROLES.MANAGER
    : USER_ROLES.CUSTOMER;

  return res.redirect(buildGoogleAuthUrl({ redirect: req.query.redirect, role }));
};

export const handleGoogleCallback = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      return res.redirect(`${getClientRedirectUrl('/auth')}?error=${encodeURIComponent('MongoDB must be connected for Google login.')}`);
    }

    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${getClientRedirectUrl('/auth')}?error=${encodeURIComponent('Google login was cancelled.')}`);
    }

    const { redirect, role } = decodeGoogleState(state);
    const profile = await exchangeGoogleCode(code);

    if (!profile.email || profile.email_verified === false) {
      return res.redirect(`${getClientRedirectUrl('/auth')}?error=${encodeURIComponent('Google account email must be verified.')}`);
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email }] });

    if (user) {
      if (!user.googleId) user.googleId = profile.sub;
      if (!user.profilePicture && profile.picture) user.profilePicture = profile.picture;
      if (user.authProvider !== 'google') user.authProvider = 'google';
      await user.save();
    } else {
      user = await User.create({
        fullName: profile.name || email.split('@')[0],
        name: profile.name || email.split('@')[0],
        email,
        googleId: profile.sub,
        authProvider: 'google',
        profilePicture: profile.picture || '',
        role,
        referralCode: generateReferralCode(email),
      });
    }

    const token = generateAuthToken(user._id);
    const callbackUrl = new URL('/auth', process.env.CLIENT_URL || 'http://localhost:5173');
    callbackUrl.searchParams.set('token', token);
    callbackUrl.searchParams.set('redirect', redirect || '/dashboard');
    return res.redirect(callbackUrl.toString());
  } catch (error) {
    const callbackUrl = new URL('/auth', process.env.CLIENT_URL || 'http://localhost:5173');
    callbackUrl.searchParams.set('error', error.message);
    return res.redirect(callbackUrl.toString());
  }
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

export const upgradeToFundraiser = async (req, res) => {
  try {
    const { cnic, address, phone } = req.body;
    req.user.role = USER_ROLES.FUNDRAISER;
    if (cnic) req.user.cnic = cnic;
    if (address) req.user.address = address;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

