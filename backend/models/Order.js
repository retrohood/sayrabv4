import mongoose from 'mongoose';
import { ORDER_PAYMENT_STATUSES, ORDER_STATUSES, PRODUCTION_STATUSES } from '../constants/index.js';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    products: { type: [orderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ORDER_PAYMENT_STATUSES,
      default: 'pending',
    },
    shippingAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Pakistan' },
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'placed',
    },
    productionStatus: {
      type: String,
      enum: PRODUCTION_STATUSES,
      default: 'queued',
    },
    trackingNumber: { type: String, trim: true },
    manufacturerNotes: { type: String, trim: true },
    revenueSplit: {
      organization: { type: Number, default: 0 },
      sayrab: { type: Number, default: 0 },
      manufacturer: { type: Number, default: 0 },
    },
    stripeSessionId: { type: String, trim: true },
    paymentIntentId: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ campaignId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });
orderSchema.index({ productionStatus: 1, createdAt: 1 });

export default mongoose.model('Order', orderSchema);
