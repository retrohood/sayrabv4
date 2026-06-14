import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    accountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    iban: { type: String, required: true, trim: true },
    easypaisaNumber: { type: String, trim: true },
    jazzcashNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    amount: { type: Number, required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
