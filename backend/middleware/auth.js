import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { USER_ROLES, isManagerRole } from '../constants/index.js';
import { createDemoUser } from '../utils/demoAuth.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (decoded.demo) {
      req.user = createDemoUser(decoded.user);
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      if (decoded.demo) {
        req.user = createDemoUser(decoded.user);
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  next();
};

export const requireFundraiser = (req, res, next) => {
  if (!req.user || (!isManagerRole(req.user.role) && req.user.role !== USER_ROLES.ADMIN)) {
    return res.status(403).json({ message: 'Campaign manager account required' });
  }
  next();
};
