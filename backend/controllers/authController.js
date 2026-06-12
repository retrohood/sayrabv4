import User from '../models/User.js';
import { USER_ROLES } from '../constants/index.js';
import { generateAuthToken, generateReferralCode } from '../utils/generateToken.js';

export const registerDonor = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: USER_ROLES.DONOR,
      referralCode: generateReferralCode(email),
    });

    res.status(201).json({
      token: generateAuthToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerFundraiser = async (req, res) => {
  try {
    const { fullName, email, password, phone, cnic, address } = req.body;

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
      role: USER_ROLES.FUNDRAISER,
      referralCode: generateReferralCode(email),
    });

    res.status(201).json({
      token: generateAuthToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateAuthToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
