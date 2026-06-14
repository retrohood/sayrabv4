import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getCampaignAnalytics = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const isOwner =
      campaign.organizer?.toString() === req.user._id.toString() ||
      campaign.managerId?.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [orders, donations, products] = await Promise.all([
      Order.find({ campaignId: campaign._id }),
      Donation.find({ campaign: campaign._id }),
      Product.find({ $or: [{ campaignId: campaign._id }, { campaign: campaign._id }] }),
    ]);

    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');
    const revenue =
      paidOrders.reduce((sum, order) => sum + order.total, 0) +
      donations.reduce((sum, donation) => sum + donation.amount, 0);
    const visits = campaign.viewCount || 0;
    const conversions = paidOrders.length + donations.length;

    const productPerformance = products.map((product) => {
      const quantitySold = paidOrders.reduce((sum, order) => {
        const productItems = order.products.filter(
          (item) => item.productId.toString() === product._id.toString()
        );
        return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);

      return {
        productId: product._id,
        name: product.name,
        quantitySold,
        revenue: quantitySold * product.price,
      };
    });

    res.json({
      campaignId: campaign._id,
      revenue,
      orders: paidOrders.length,
      donations: donations.length,
      traffic: visits,
      conversionRate: visits ? Number(((conversions / visits) * 100).toFixed(2)) : 0,
      goalProgress: campaign.fundingGoal
        ? Number(((campaign.amountRaised / campaign.fundingGoal) * 100).toFixed(2))
        : 0,
      productPerformance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
