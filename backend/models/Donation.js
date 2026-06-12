import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../constants/index.js';

const donationSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorName: { type: String, required: true },
    donorEmail: { type: String },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
    referralCode: { type: String },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    receiptNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('Donation', donationSchema);
