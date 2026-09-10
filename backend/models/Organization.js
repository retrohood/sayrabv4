import mongoose from 'mongoose';
import { ORGANIZATION_STATUS } from '../constants/index.js';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    category: { type: String, default: 'Non-Profit / NGO' },
    description: { type: String, trim: true },
    logo: { type: String, default: '' },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    registrationNumber: { type: String, trim: true },
    taxId: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(ORGANIZATION_STATUS),
      default: ORGANIZATION_STATUS.PENDING,
    },
    rejectionReason: { type: String, default: '' },
    verifiedAt: { type: Date },
    suspendedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String, default: 'application/pdf' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    bankDetails: {
      bankName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      iban: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
      swiftCode: { type: String, default: '' },
    },
    totalRevenue: { type: Number, default: 0 },
    totalRaised: { type: Number, default: 0 },
    pendingPayoutBalance: { type: Number, default: 0 },
    paidOutAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ status: 1 });

export default mongoose.model('Organization', organizationSchema);
