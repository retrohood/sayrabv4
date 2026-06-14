import Order from '../models/Order.js';
import { PRODUCTION_STATUSES } from '../constants/index.js';

export const getProductionQueue = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = {
      paymentStatus: 'paid',
      productionStatus: status && PRODUCTION_STATUSES.includes(status) ? status : { $ne: 'delivered' },
    };

    const orders = await Order.find(filter)
      .populate('campaignId', 'title managerId')
      .populate('customerId', 'fullName email')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProductionStatus = async (req, res) => {
  try {
    const { productionStatus, trackingNumber, manufacturerNotes } = req.body;
    if (!PRODUCTION_STATUSES.includes(productionStatus)) {
      return res.status(400).json({ message: 'Invalid production status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.productionStatus = productionStatus;
    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.manufacturerNotes = manufacturerNotes ?? order.manufacturerNotes;

    if (productionStatus === 'in_production' || productionStatus === 'quality_check') {
      order.orderStatus = 'production';
    }
    if (productionStatus === 'shipped') {
      order.orderStatus = 'shipped';
    }
    if (productionStatus === 'delivered') {
      order.orderStatus = 'delivered';
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
