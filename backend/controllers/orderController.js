import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Campaign from '../models/Campaign.js';
import { calculateRevenueSplit } from '../utils/revenueSplit.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';

export const createOrder = async (req, res) => {
  try {
    const { campaignId, products = [], shippingAddress = {}, paymentStatus = 'pending' } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!products.length) {
      return res.status(400).json({ message: 'Order must include at least one product' });
    }

    const productIds = products.map((item) => item.productId);
    const catalogProducts = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(catalogProducts.map((product) => [product._id.toString(), product]));

    const orderItems = products.map((item) => {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const quantity = Math.max(1, Number(item.quantity || 1));
      return {
        productId: product._id,
        name: product.name,
        quantity,
        price: product.price,
        size: item.size,
        color: item.color,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      customerId: req.user?._id,
      campaignId,
      products: orderItems,
      total,
      paymentStatus,
      orderStatus: paymentStatus === 'paid' ? 'paid' : 'placed',
      productionStatus: paymentStatus === 'paid' ? 'queued' : undefined,
      revenueSplit: calculateRevenueSplit(total),
      shippingAddress,
      stripeSessionId: req.body.stripeSessionId,
      paymentIntentId: req.body.paymentIntentId,
    });

    if (paymentStatus === 'paid') {
      campaign.amountRaised += (total * 0.5);
      campaign.raisedAmount = campaign.amountRaised;
      await campaign.save();
    }

    res.status(201).json(order);
  } catch (error) {
    const status = error.message.startsWith('Product not found') ? 404 : 500;
    res.status(status).json({ message: error.message });
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
      order.productionStatus = order.productionStatus || 'queued';
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

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Customer requested cancellation' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.customerId?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.shippingStatus === 'shipped' || order.shippingStatus === 'delivered' || order.orderStatus === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel an order that has already been shipped or delivered' });
    }

    // Check 2 days (48 hours) window
    const orderAgeHours = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    if (orderAgeHours > 48) {
      return res.status(400).json({
        message: 'Withdrawal and cancellation requests can only be made within 2 days (48 hours) of placing the order.',
      });
    }

    order.orderStatus = 'cancelled';
    order.refundStatus = 'requested';
    order.refundReason = reason;
    order.refundAmount = order.total;

    // Deduct from campaign if it was paid
    if (order.paymentStatus === 'paid' && order.campaignId) {
      const campaign = await Campaign.findById(order.campaignId);
      if (campaign) {
        const splitAmount = order.revenueSplit?.organization || (order.total * 0.5);
        campaign.amountRaised = Math.max(0, campaign.amountRaised - splitAmount);
        campaign.raisedAmount = campaign.amountRaised;
        await campaign.save();
      }
    }

    await order.save();
    res.json({ success: true, message: 'Order cancelled and withdrawal/refund request submitted successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestSample = async (req, res) => {
  try {
    const { productId, campaignId, size, color, shippingAddress, notes } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const trackingNum = 'SMP-TRK-' + Math.floor(100000 + Math.random() * 900000);
    const order = await Order.create({
      customerId: req.user._id,
      campaignId: campaignId || product.campaignId || undefined,
      products: [{
        productId: product._id,
        name: `[Sample] ${product.name}`,
        quantity: 1,
        price: 0,
        size: size || (product.sizes?.[0] || 'M'),
        color: color || (product.colors?.[0] || 'Standard'),
      }],
      total: 0,
      paymentStatus: 'paid',
      orderStatus: 'paid',
      productionStatus: 'sample_in_production',
      shippingStatus: 'ready_to_ship',
      shippingAddress: shippingAddress || {
        fullName: req.user.fullName,
        phone: req.user.phone,
        line1: req.user.address || 'Standard Address',
        city: 'Lahore',
        country: 'Pakistan',
      },
      carrier: 'TCS Sample Logistics',
      trackingNumber: trackingNum,
      manufacturerNotes: notes || 'Sample requested by customer for review',
    });

    res.status(201).json({
      success: true,
      message: 'Sample request submitted successfully. You will receive tracking updates as the sample is produced and dispatched.',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
