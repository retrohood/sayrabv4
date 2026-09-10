import Order from '../models/Order.js';
import Techpack from '../models/Techpack.js';
import SampleProduction from '../models/SampleProduction.js';
import Manufacturer from '../models/Manufacturer.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import { REVENUE_SPLIT } from '../constants/index.js';

// Helper to get active manufacturer ID or fallback to first registered manufacturer
const getManufacturerContext = async (req) => {
  if (req.user && req.user.manufacturerId) {
    return req.user.manufacturerId;
  }
  const m = await Manufacturer.findOne();
  return m ? m._id : null;
};

// 1. Overview KPIs & Activity
export const getOverview = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const filter = manufacturerId ? { assignedManufacturer: manufacturerId } : {};

    const orders = await Order.find(filter).lean();
    const techpacks = await Techpack.find(manufacturerId ? { assignedManufacturer: manufacturerId } : {}).lean();

    const activeOrdersCount = orders.filter(o => ['accepted', 'in_production', 'quality_check', 'waiting'].includes(o.productionStatus)).length;
    const pendingTechpacksCount = techpacks.filter(t => ['pending_review', 'approved', 'revision_requested'].includes(t.status)).length;
    const readyToShipCount = orders.filter(o => o.productionStatus === 'ready_to_ship' || o.shippingStatus === 'ready_to_ship').length;
    const completedOrdersCount = orders.filter(o => o.productionStatus === 'delivered' || o.orderStatus === 'delivered').length;

    // Total Revenue Earned (45% split)
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalRevenueEarned = paidOrders.reduce((sum, o) => {
      const manufacturerShare = o.revenueSplit?.manufacturer || Math.round(o.total * REVENUE_SPLIT.MANUFACTURER);
      return sum + manufacturerShare;
    }, 0);

    // Average Bulk Production Progress
    const inProdOrders = orders.filter(o => ['in_production', 'quality_check'].includes(o.productionStatus));
    const avgProgress = inProdOrders.length > 0
      ? Math.round(inProdOrders.reduce((acc, o) => acc + (o.bulkProgress || 0), 0) / inProdOrders.length)
      : (orders.length > 0 ? 100 : 0);

    // Recent Activities
    const recentActivities = [
      ...orders.slice(-5).map(o => ({
        id: o._id,
        type: 'order',
        title: `Order #${o.invoiceNumber || o._id.toString().substring(0, 8)}`,
        status: o.productionStatus || 'placed',
        time: o.updatedAt,
        details: `Status set to ${o.productionStatus || 'placed'}`,
      })),
      ...techpacks.slice(-5).map(t => ({
        id: t._id,
        type: 'techpack',
        title: `Techpack: ${t.title}`,
        status: t.status,
        time: t.updatedAt,
        details: `Techpack status: ${t.status}`,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    res.json({
      success: true,
      data: {
        metrics: {
          activeProductionOrders: activeOrdersCount,
          pendingTechpacks: pendingTechpacksCount,
          ordersReadyToShip: readyToShipCount,
          completedOrders: completedOrdersCount,
          totalRevenueEarned,
          productionProgress: avgProgress,
        },
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. View All Assigned Production Orders
export const getProductionOrders = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const { status } = req.query;

    const filter = manufacturerId ? { assignedManufacturer: manufacturerId } : {};
    if (status && status !== 'all') {
      filter.productionStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('campaignId', 'title goalAmount organizationId')
      .populate('customerId', 'name email')
      .populate({
        path: 'campaignId',
        populate: { path: 'organizationId', select: 'name verified' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map(o => {
      const totalQty = o.products?.reduce((acc, p) => acc + (p.quantity || 1), 0) || 1;
      const manufacturerShare = o.revenueSplit?.manufacturer || Math.round(o.total * REVENUE_SPLIT.MANUFACTURER);
      
      return {
        _id: o._id,
        campaignName: o.campaignId?.title || 'General Campaign',
        organization: o.campaignId?.organizationId?.name || 'Verified Org',
        product: o.products?.[0]?.name || 'Merchandise Item',
        productsCount: o.products?.length || 1,
        quantity: totalQty,
        deadline: o.estimatedDelivery || new Date(Date.now() + 14 * 86400000),
        priority: o.priority || 'normal',
        assignedDate: o.assignedDate || o.createdAt,
        status: o.productionStatus || 'pending',
        paymentStatus: o.paymentStatus || 'paid',
        totalAmount: o.total,
        manufacturerRevenueShare: manufacturerShare,
        bulkProgress: o.bulkProgress || 0,
        rejectionReason: o.rejectionReason || '',
        shippingAddress: o.shippingAddress,
      };
    });

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept or Reject Production Order
export const acceptOrRejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'accept' | 'reject'

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (action === 'accept') {
      order.productionStatus = 'accepted';
      order.rejectionReason = '';
    } else if (action === 'reject') {
      order.productionStatus = 'rejected';
      order.rejectionReason = reason || 'Capacity constraints';
    }

    await order.save();
    res.json({ success: true, message: `Order production ${action}ed successfully`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order Production Status & Progress
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { productionStatus, bulkProgress } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (productionStatus) order.productionStatus = productionStatus;
    if (typeof bulkProgress === 'number') order.bulkProgress = Math.min(100, Math.max(0, bulkProgress));

    if (productionStatus === 'shipped') {
      order.shippingStatus = 'shipped';
      order.dispatchDate = new Date();
    } else if (productionStatus === 'delivered') {
      order.shippingStatus = 'delivered';
    }

    await order.save();
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Techpack Management
export const getTechpacks = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const techpacks = await Techpack.find(manufacturerId ? { assignedManufacturer: manufacturerId } : {})
      .populate('campaign', 'title')
      .populate('product', 'name price category')
      .sort({ createdAt: -1 })
      .lean();

    const formattedTechpacks = techpacks.map(t => ({
      _id: t._id,
      title: t.title,
      campaignName: t.campaign?.title || 'Campaign Techpack',
      productName: t.product?.name || 'Custom Garment',
      version: t.version || '1.0',
      files: t.files || [{ name: 'Techpack_Specification.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }],
      previewImages: t.previewImages?.length ? t.previewImages : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'],
      measurements: t.measurements || { S: '38in', M: '40in', L: '42in', XL: '44in' },
      materials: t.materials?.length ? t.materials : ['100% Ring-Spun Cotton', '240 GSM Heavyweight Fleece', 'Screen Printed Graphics'],
      sizeCharts: ['S (Chest: 38")', 'M (Chest: 40")', 'L (Chest: 42")', 'XL (Chest: 44")', '2XL (Chest: 46")'],
      colorVariants: ['Jet Black', 'Heather Grey', 'Navy Blue'],
      status: t.status || 'approved',
      adminNotes: t.adminNotes,
      manufacturerNotes: t.manufacturerNotes || '',
      issueReported: t.issueReported || '',
      createdAt: t.createdAt,
    }));

    res.json({ success: true, data: formattedTechpacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Action Techpack (Accept, Request Revision, Report Issue)
export const actionTechpack = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'accept' | 'request_revision' | 'report_issue'

    const techpack = await Techpack.findById(id);
    if (!techpack) {
      return res.status(404).json({ success: false, message: 'Techpack not found' });
    }

    if (action === 'accept') {
      techpack.status = 'accepted_by_manufacturer';
      techpack.manufacturerNotes = notes || 'Techpack specs confirmed';
    } else if (action === 'request_revision') {
      techpack.status = 'revision_requested';
      techpack.revisionNotes = notes || 'Revision required on sizing specifications';
    } else if (action === 'report_issue') {
      techpack.status = 'rejected';
      techpack.issueReported = notes || 'Material availability issue reported';
    }

    await techpack.save();
    res.json({ success: true, message: `Techpack ${action} executed`, data: techpack });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Sample Production Management Workflow
export const getSamples = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const samples = await SampleProduction.find(manufacturerId ? { manufacturer: manufacturerId } : {})
      .populate('techpack', 'title files previewImages')
      .populate('campaign', 'title')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: samples });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSample = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, samplePhoto, courier, trackingNumber } = req.body;

    let sample = await SampleProduction.findById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample record not found' });
    }

    if (status) sample.status = status;
    if (samplePhoto) {
      sample.samplePhotos.push({ url: samplePhoto, caption: 'Sample detail photo', uploadedAt: new Date() });
    }
    if (courier) sample.courier = courier;
    if (trackingNumber) sample.trackingNumber = trackingNumber;

    if (status === 'sample_completed') sample.completedAt = new Date();
    if (status === 'sample_shipped') sample.shippedAt = new Date();

    await sample.save();
    res.json({ success: true, message: 'Sample production updated', data: sample });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Bulk Production Updates
export const updateBulkProduction = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action, progress } = req.body; // action: 'start' | 'update_progress' | 'pause' | 'complete'

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (action === 'start') {
      order.productionStatus = 'in_production';
      order.bulkProgress = order.bulkProgress || 10;
    } else if (action === 'update_progress') {
      order.bulkProgress = Math.min(100, Math.max(0, Number(progress) || 0));
      if (order.bulkProgress === 100) order.productionStatus = 'quality_check';
    } else if (action === 'pause') {
      order.manufacturerNotes = `Production paused on ${new Date().toLocaleDateString()}`;
    } else if (action === 'complete') {
      order.productionStatus = 'ready_to_ship';
      order.bulkProgress = 100;
    }

    await order.save();
    res.json({ success: true, message: `Bulk production updated (${action})`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Shipping Management
export const getShippingQueue = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const filter = manufacturerId ? { assignedManufacturer: manufacturerId } : {};
    
    const orders = await Order.find({
      ...filter,
      productionStatus: { $in: ['ready_to_ship', 'shipped', 'delivered', 'quality_check'] }
    })
    .populate('campaignId', 'title')
    .sort({ updatedAt: -1 })
    .lean();

    const formattedQueue = orders.map(o => ({
      _id: o._id,
      invoiceNumber: o.invoiceNumber || o._id.toString().substring(0, 8).toUpperCase(),
      campaignName: o.campaignId?.title || 'Merchandise Campaign',
      productsCount: o.products?.length || 1,
      itemSummary: o.products?.map(p => `${p.quantity}x ${p.name}`).join(', ') || '1x Merchandise',
      shippingAddress: o.shippingAddress,
      carrier: o.carrier || 'TCS Logistics',
      trackingNumber: o.trackingNumber || '',
      dispatchDate: o.dispatchDate,
      estimatedDelivery: o.estimatedDelivery,
      shippingStatus: o.shippingStatus || (o.productionStatus === 'shipped' ? 'shipped' : 'ready_to_ship'),
      productionStatus: o.productionStatus,
    }));

    res.json({ success: true, data: formattedQueue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { carrier, trackingNumber, dispatchDate, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.carrier = carrier || 'TCS Logistics';
    order.trackingNumber = trackingNumber;
    order.dispatchDate = dispatchDate ? new Date(dispatchDate) : new Date();
    order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 3 * 86400000);
    order.shippingStatus = 'shipped';
    order.productionStatus = 'shipped';

    await order.save();
    res.json({ success: true, message: 'Shipment generated and order dispatched', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Manufacturer Earnings & Payments (45% Share)
export const getPayments = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const filter = manufacturerId ? { assignedManufacturer: manufacturerId } : {};

    const orders = await Order.find(filter)
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const payments = orders.map(o => {
      const earnedAmount = o.revenueSplit?.manufacturer || Math.round(o.total * REVENUE_SPLIT.MANUFACTURER);
      
      let pStatus = 'scheduled';
      if (o.productionStatus === 'delivered') pStatus = 'paid';
      else if (o.productionStatus === 'pending' || o.paymentStatus !== 'paid') pStatus = 'pending';

      return {
        _id: o._id,
        invoiceNumber: o.invoiceNumber || `INV-${o._id.toString().substring(0, 6)}`,
        campaignName: o.campaignId?.title || 'Merchandise Campaign',
        totalOrderValue: o.total,
        amountEarned: earnedAmount,
        revenueSharePercentage: '45%',
        paymentStatus: pStatus,
        paymentDate: o.dispatchDate || o.updatedAt,
        transactionRef: `TXN-MFG-${o._id.toString().substring(18).toUpperCase()}`,
      };
    });

    const totalEarned = payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amountEarned, 0);
    const pendingPayout = payments.filter(p => p.paymentStatus !== 'paid').reduce((sum, p) => sum + p.amountEarned, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalEarned,
          pendingPayout,
          revenueShare: '45%',
        },
        ledger: payments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Notifications
export const getNotifications = async (req, res) => {
  try {
    const alerts = [
      {
        id: '1',
        type: 'new_order',
        title: 'New Production Order Assigned',
        message: 'Order #ORD-9821 assigned for Winter Hoodies production.',
        time: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: '2',
        type: 'techpack_approved',
        title: 'Techpack Approved',
        message: 'Admin approved techpack for Medical Relief Tees.',
        time: new Date(Date.now() - 86400000),
        read: true,
      },
      {
        id: '3',
        type: 'sample_approval',
        title: 'Sample Approved by Org Leader',
        message: 'Sample #SMP-402 approved. Bulk production can proceed.',
        time: new Date(Date.now() - 172800000),
        read: true,
      },
      {
        id: '4',
        type: 'payment_update',
        title: 'Payout Released',
        message: '45% Revenue payout of PKR 85,500 transferred to account.',
        time: new Date(Date.now() - 259200000),
        read: true,
      },
    ];

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Reports & SLA Metrics
export const getReports = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    const orders = await Order.find(manufacturerId ? { assignedManufacturer: manufacturerId } : {}).lean();

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => ['delivered', 'shipped'].includes(o.productionStatus)).length;
    const onTimeDeliveryRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;
    const averageProductionTime = 4.2; // average days

    const totalEarnings = orders.reduce((sum, o) => {
      const share = o.revenueSplit?.manufacturer || Math.round(o.total * REVENUE_SPLIT.MANUFACTURER);
      return sum + share;
    }, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        averageProductionTime,
        onTimeDeliveryRate,
        totalEarnings,
        history: orders.map(o => ({
          orderId: o._id,
          invoice: o.invoiceNumber || o._id.toString().substring(0, 8),
          total: o.total,
          manufacturerEarnings: o.revenueSplit?.manufacturer || Math.round(o.total * REVENUE_SPLIT.MANUFACTURER),
          status: o.productionStatus || 'placed',
          createdAt: o.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Profile Management
export const getProfile = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    let manufacturer = null;
    if (manufacturerId) {
      manufacturer = await Manufacturer.findById(manufacturerId).lean();
    }
    if (!manufacturer) {
      manufacturer = {
        name: 'Apex TexCraft Manufacturing Ltd.',
        email: 'manufacturer@sayrab.com',
        phone: '+92 300 9876543',
        plantLocation: 'Plot 45, Industrial Zone, S.I.T.E, Karachi, Pakistan',
        monthlyCapacity: '25,000 Units',
        specialties: ['Apparel', 'Embroidery', 'Screen Printing', 'Heavy Fleece'],
        contactPerson: 'Tariq Mehmood',
        verified: true,
      };
    }

    res.json({ success: true, data: manufacturer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const manufacturerId = await getManufacturerContext(req);
    if (!manufacturerId) {
      return res.json({ success: true, message: 'Profile updated in demo mode', data: req.body });
    }

    const updated = await Manufacturer.findByIdAndUpdate(manufacturerId, req.body, { new: true });
    res.json({ success: true, message: 'Manufacturer profile updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
