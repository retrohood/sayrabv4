import express from 'express';
import {
  getOverview,
  getProductionOrders,
  acceptOrRejectOrder,
  updateOrderStatus,
  getTechpacks,
  actionTechpack,
  getSamples,
  updateSample,
  updateBulkProduction,
  getShippingQueue,
  generateShipment,
  getPayments,
  getNotifications,
  getReports,
  getProfile,
  updateProfile,
} from '../controllers/manufacturerController.js';

const router = express.Router();

// Overview
router.get('/overview', getOverview);

// Production Orders
router.get('/orders', getProductionOrders);
router.put('/orders/:id/accept', acceptOrRejectOrder);
router.put('/orders/:id/status', updateOrderStatus);

// Techpack Management
router.get('/techpacks', getTechpacks);
router.put('/techpacks/:id/action', actionTechpack);

// Sample Production
router.get('/samples', getSamples);
router.put('/samples/:id', updateSample);

// Bulk Production
router.put('/bulk/:orderId', updateBulkProduction);

// Shipping
router.get('/shipping', getShippingQueue);
router.put('/shipping/:orderId', generateShipment);

// Payments (45% Revenue Split)
router.get('/payments', getPayments);

// Notifications & Reports
router.get('/notifications', getNotifications);
router.get('/reports', getReports);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
