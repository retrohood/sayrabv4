import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Campaign from '../models/Campaign.js';
import { calculateRevenueSplit } from '../utils/revenueSplit.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';

import { isManagerRole, USER_ROLES } from '../constants/index.js';

export const createOrder = async (req, res) => {
  try {
    const isFundraiserAccount = (userObj) => {
      if (!userObj) return false;
      const r = (userObj.role || '').toLowerCase();
      return (
        r === USER_ROLES.FUNDRAISER ||
        r === USER_ROLES.MANAGER ||
        r === USER_ROLES.ORG_LEADER ||
        r === 'fundraiser' ||
        r === 'manager' ||
        r === 'org_leader' ||
        Boolean(userObj.isVerifiedFundraiser) ||
        isManagerRole(r)
      );
    };

    if (req.user && isFundraiserAccount(req.user)) {
      return res.status(403).json({
        message: 'Fundraiser accounts cannot purchase merchandise. Merchandise purchases are for buyers and donors only.',
      });
    }

    const { campaignId, products = [], shippingAddress = {}, paymentStatus = 'paid' } = req.body;

    if (!products.length) {
      return res.status(400).json({ message: 'Order must include at least one product' });
    }

    if (!isDatabaseConnected(mongoose)) {
      let campaign = null;
      if (campaignId) {
        campaign = inMemoryDB.campaigns.findOne({ _id: campaignId });
      }
      if (!campaign && products.length > 0) {
        const firstProdId = products[0]?.productId;
        const prod = inMemoryDB.products.findOne({ _id: firstProdId });
        if (prod && prod.campaignId) {
          const cId = prod.campaignId?._id || prod.campaignId;
          campaign = inMemoryDB.campaigns.findOne({ _id: cId });
        }
      }
      if (!campaign) {
        campaign = inMemoryDB.campaigns.find()[0];
      }

      const orderItems = products.map((item) => {
        const prod = inMemoryDB.products.findOne({ _id: item.productId }) || item;
        return {
          productId: item.productId,
          name: prod.name || item.name || 'Merchandise Item',
          price: Number(prod.price || item.price || 0),
          quantity: Math.max(1, Number(item.quantity || item.qty || 1)),
          size: item.size || item.selectedSize || 'M',
          color: item.color || item.selectedColor || 'Standard',
        };
      });

      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = inMemoryDB.orders.create({
        customerId: {
          _id: req.user?._id || 'guest',
          fullName: shippingAddress.fullName || req.user?.fullName || 'Buyer',
          email: req.user?.email || 'buyer@example.com',
          phone: shippingAddress.phone || req.user?.phone || '03001234567',
        },
        campaignId: {
          _id: campaign?._id || campaignId,
          title: campaign?.title || 'Charity Campaign',
          slug: campaign?.slug || 'campaign',
        },
        products: orderItems,
        total,
        paymentStatus: paymentStatus || 'paid',
        orderStatus: 'placed',
        productionStatus: 'queued',
        revenueSplit: calculateRevenueSplit(total),
        shippingAddress: {
          fullName: shippingAddress.fullName || req.user?.fullName || 'Buyer',
          phone: shippingAddress.phone || req.user?.phone || '03001234567',
          address: shippingAddress.line1 || shippingAddress.address || 'Street 1, Main Road',
          city: shippingAddress.city || 'Lahore',
          state: shippingAddress.state || 'Punjab',
          country: shippingAddress.country || 'Pakistan',
        },
        paymentMethod: req.body.paymentMethod || 'Credit / Debit Card',
        createdAt: new Date().toISOString(),
      });

      if (campaign) {
        campaign.amountRaised = (campaign.amountRaised || 0) + (total * 0.5);
      }

      return res.status(201).json(order);
    }

    let campaign = null;
    if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
      campaign = await Campaign.findById(campaignId);
    }
    if (!campaign && products.length > 0) {
      const firstProdId = products[0]?.productId;
      if (firstProdId && mongoose.Types.ObjectId.isValid(firstProdId)) {
        const prodDoc = await Product.findById(firstProdId);
        if (prodDoc && prodDoc.campaignId) {
          campaign = await Campaign.findById(prodDoc.campaignId);
        }
      }
    }
    if (!campaign) {
      campaign = (await Campaign.findOne({ lifecycleStatus: 'active' })) || (await Campaign.findOne());
    }

    if (!campaign) {
      return res.status(404).json({ message: 'No campaign found to associate with order' });
    }

    const productIds = products.map((item) => item.productId).filter((id) => mongoose.Types.ObjectId.isValid(id));
    const catalogProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(catalogProducts.map((product) => [product._id.toString(), product]));

    const orderItems = products.map((item) => {
      const product = item.productId ? productMap.get(item.productId.toString()) : null;
      const quantity = Math.max(1, Number(item.quantity || item.qty || 1));
      return {
        productId: product?._id || (mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : undefined),
        name: item.name || product?.name || 'Merchandise Product',
        quantity,
        price: Number(item.price || product?.price || 0),
        size: item.size || item.selectedSize || 'M',
        color: item.color || item.selectedColor || 'Standard',
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      customerId: req.user?._id,
      campaignId: campaign._id,
      products: orderItems,
      total,
      paymentStatus: paymentStatus || 'paid',
      orderStatus: paymentStatus === 'paid' ? 'paid' : 'placed',
      productionStatus: paymentStatus === 'paid' ? 'waiting' : 'waiting',
      revenueSplit: calculateRevenueSplit(total),
      shippingAddress: {
        fullName: shippingAddress.fullName || req.user?.fullName || 'Buyer',
        phone: shippingAddress.phone || req.user?.phone || '',
        line1: shippingAddress.line1 || shippingAddress.address || 'Standard Delivery',
        city: shippingAddress.city || 'Lahore',
        state: shippingAddress.state || 'Punjab',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'Pakistan',
      },
      stripeSessionId: req.body.stripeSessionId,
      paymentIntentId: req.body.paymentIntentId,
    });

    if (paymentStatus === 'paid') {
      campaign.amountRaised += total * 0.5;
      campaign.raisedAmount = campaign.amountRaised;
      await campaign.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('campaignId', 'title slug banner thumbnail managerId')
      .populate('customerId', 'fullName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.customerId?._id?.toString() === req.user?._id?.toString();
    const isManager = order.campaignId?.managerId?.toString() === req.user?._id?.toString();

    if (req.user && !isOwner && !isManager && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('campaignId', 'title slug')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus, stripeSessionId, paymentIntentId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const wasPaid = order.paymentStatus === 'paid';
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.stripeSessionId = stripeSessionId || order.stripeSessionId;
    order.paymentIntentId = paymentIntentId || order.paymentIntentId;

    if (order.paymentStatus === 'paid') {
      order.orderStatus = order.orderStatus === 'placed' ? 'paid' : order.orderStatus;
      order.productionStatus = order.productionStatus || 'waiting';
    }

    await order.save();

    if (!wasPaid && order.paymentStatus === 'paid') {
      const campaign = await Campaign.findById(order.campaignId);
      if (campaign) {
        const splitAmount = order.revenueSplit?.organization || (order.total * 0.5);
        campaign.amountRaised += splitAmount;
        campaign.raisedAmount = campaign.amountRaised;
        await campaign.save();
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!isDatabaseConnected(mongoose)) {
      const orders = inMemoryDB.orders.find({ campaignId });
      return res.json(orders);
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (req.user.role !== 'admin' && campaign.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this campaign\'s orders' });
    }

    const orders = await Order.find({ campaignId })
      .populate('customerId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFundraiserOrders = async (req, res) => {
  try {
    const userId = req.user?._id ? req.user._id.toString() : '';

    if (!isDatabaseConnected(mongoose)) {
      const myCampaigns = inMemoryDB.campaigns.find().filter((c) => {
        const orgId = c.organizer?._id ? c.organizer._id.toString() : (c.organizer ? c.organizer.toString() : '');
        const mgrId = c.managerId?._id ? c.managerId._id.toString() : (c.managerId ? c.managerId.toString() : '');
        return (
          orgId === userId ||
          mgrId === userId ||
          orgId === 'demo-user-local' ||
          mgrId === 'demo-user-local' ||
          req.user?.role === 'admin'
        );
      });
      const myCampaignIds = myCampaigns.map((c) => c._id.toString());
      const orders = inMemoryDB.orders.find().filter((o) => {
        const cId = o.campaignId?._id ? o.campaignId._id.toString() : (o.campaignId ? o.campaignId.toString() : '');
        return myCampaignIds.includes(cId);
      });
      return res.json(orders);
    }

    const campaigns = await Campaign.find({
      $or: [{ organizer: req.user._id }, { managerId: req.user._id }],
    }).select('_id');
    const campaignIds = campaigns.map((c) => c._id);

    const orders = await Order.find({ campaignId: { $in: campaignIds } })
      .populate('campaignId', 'title slug thumbnail category amountRaised fundingGoal organizer managerId')
      .populate('customerId', 'fullName email phone address')
      .populate('products.productId', 'image name price category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

