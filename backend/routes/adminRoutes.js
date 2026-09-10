import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../constants/index.js';
import {
  getAdminOverview,
  listOrganizations,
  getOrganizationById,
  reviewOrganization,
  listUsers,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  listAllCampaigns,
  updateCampaignStatus,
  listPayouts,
  reviewPayout,
  listManufacturers,
  createManufacturer,
  updateManufacturer,
  listTechpacks,
  reviewTechpack,
  listAllOrders,
  updateOrderStatus,
  refundOrder,
  listTransactions,
  flagTransaction,
  getAdminReports,
  listAdminNotifications,
  markNotificationAsRead,
  getPlatformSettings,
  updatePlatformSettings,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected and require ADMIN role
router.use(protect, authorize(USER_ROLES.ADMIN));

// Platform KPIs & Overview
router.get('/overview', getAdminOverview);

// Organization Management
router.get('/organizations', listOrganizations);
router.get('/organizations/:id', getOrganizationById);
router.put('/organizations/:id/verify', reviewOrganization);

// User Management
router.get('/users', listUsers);
router.put('/users/:id/status', updateUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

// Campaign Management
router.get('/campaigns', listAllCampaigns);
router.put('/campaigns/:id/status', updateCampaignStatus);

// Payout Management
router.get('/payouts', listPayouts);
router.put('/payouts/:id', reviewPayout);

// Manufacturer Management
router.get('/manufacturers', listManufacturers);
router.post('/manufacturers', createManufacturer);
router.put('/manufacturers/:id', updateManufacturer);

// Techpack Approvals
router.get('/techpacks', listTechpacks);
router.put('/techpacks/:id', reviewTechpack);

// Order Management
router.get('/orders', listAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', refundOrder);

// Transactions & Fraud
router.get('/transactions', listTransactions);
router.put('/transactions/:id/flag', flagTransaction);

// Reports & Exports
router.get('/reports', getAdminReports);

// Notifications Hub
router.get('/notifications', listAdminNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

// Platform Settings
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

export default router;
