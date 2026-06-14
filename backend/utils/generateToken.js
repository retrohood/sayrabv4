import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

export const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: '30d',
  });
};

export const generateDemoAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      demo: true,
      user: user.toPublicJSON(),
    },
    process.env.JWT_SECRET || 'dev_secret',
    {
      expiresIn: '30d',
    }
  );
};

export const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base}-${nanoid(6)}`;
};

export const generateReferralCode = (userId) => {
  return `ref_${userId.toString().slice(-6)}_${nanoid(4)}`;
};

export const generateReceiptNumber = () => {
  return `RCP-${Date.now()}-${nanoid(6).toUpperCase()}`;
};
