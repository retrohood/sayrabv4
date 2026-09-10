import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'verification_request',
        'payout_request',
        'failed_payment',
        'techpack_approval',
        'campaign_report',
        'manufacturer_update',
        'suspicious_transaction',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'success'],
      default: 'info',
    },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model('AdminNotification', adminNotificationSchema);
