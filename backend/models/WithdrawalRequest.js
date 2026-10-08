import mongoose from 'mongoose';
import { PAYOUT_STATUS } from '../constants/index.js';

const withdrawalRequestSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manufacturer',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    recipientType: {
      type: String,
      enum: ['organization', 'fundraiser', 'manufacturer'],
      default: 'organization',
    },
    accountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    iban: { type: String, trim: true },
    easypaisaNumber: { type: String, trim: true },
    jazzcashNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'not_available',
        'available',
        'requested',
        'pending',
        'pending_review',
        'scheduled',
        'approved',
        'processing',
        'paid',
        'rejected',
      ],
      default: 'requested',
    },
    amount: { type: Number, required: true },
    totalRevenue: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    manufacturerShare: { type: Number, default: 0 },
    organizationShare: { type: Number, default: 0 },
    requestedDate: { type: Date, default: Date.now },
    eligiblePayoutDate: { type: Date },
    transferProof: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminNote: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

withdrawalRequestSchema.virtual('isRefundWindowPassed').get(function () {
  if (!this.eligiblePayoutDate) return true;
  return new Date() >= new Date(this.eligiblePayoutDate);
});

withdrawalRequestSchema.set('toJSON', { virtuals: true });
withdrawalRequestSchema.set('toObject', { virtuals: true });

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
