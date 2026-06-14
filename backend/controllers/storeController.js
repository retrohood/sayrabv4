import mongoose from 'mongoose';
import Store from '../models/Store.js';
import User from '../models/User.js';
import { USER_ROLES, isCustomerRole } from '../constants/index.js';
import { generateAuthToken, generateReferralCode } from '../utils/generateToken.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';

export const openStore = async (req, res) => {
  try {
    const { fullName, storeName, merchType, organization, description, email } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const existing = inMemoryDB.stores.findOne({ owner: req.user._id });
      if (existing) {
        return res.status(400).json({ message: 'You already have a store' });
      }

      if (isCustomerRole(req.user.role)) {
        req.user.role = USER_ROLES.MANAGER;
      }

      const store = inMemoryDB.stores.create({
        owner: req.user._id,
        creator: req.user._id,
        fullName,
        storeName,
        merchType,
        organization,
        description,
        email: email || req.user.email,
      });

      return res.status(201).json({
        store,
        user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user,
        token: 'demo-token-local',
      });
    }

    const existing = await Store.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a store' });
    }

    if (isCustomerRole(req.user.role)) {
      req.user.role = USER_ROLES.MANAGER;
      await req.user.save();
    }

    const store = await Store.create({
      owner: req.user._id,
      fullName,
      storeName,
      merchType,
      organization,
      description,
      email: email || req.user.email,
    });

    res.status(201).json({
      store,
      user: req.user.toPublicJSON(),
      token: generateAuthToken(req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyStore = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      const store = inMemoryDB.stores.findOne({ owner: req.user._id });
      return res.json(store);
    }
    const store = await Store.findOne({ owner: req.user._id });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
