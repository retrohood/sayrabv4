import Order from '../models/Order.js';

export const createPaymentSession = async (req, res) => {
  try {
    const { campaignId, items = [], orderId, successUrl, cancelUrl } = req.body;

    if ((!campaignId && !orderId) || !items.length) {
      return res.status(400).json({ message: 'campaignId or orderId and items are required' });
    }

    const sessionId = `mock_session_${Date.now()}`;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { stripeSessionId: sessionId });
    }

    res.status(201).json({
      provider: 'mock',
      sessionId,
      checkoutUrl:
        successUrl ||
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?session_id=${sessionId}`,
      cancelUrl: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/cart`,
      message: 'Mock checkout session created. Configure Stripe to enable live payments.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  try {
    const { orderId, stripeSessionId, paymentIntentId, paymentStatus = 'paid' } = req.body;

    const order = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ stripeSessionId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found for webhook event' });
    }

    order.paymentStatus = paymentStatus;
    order.paymentIntentId = paymentIntentId || order.paymentIntentId;
    if (paymentStatus === 'paid') {
      order.orderStatus = order.orderStatus === 'placed' ? 'paid' : order.orderStatus;
      order.productionStatus = order.productionStatus || 'queued';
    }
    await order.save();

    res.json({ received: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
