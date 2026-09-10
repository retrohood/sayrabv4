import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    platformCommission: { type: Number, default: 5 }, // 5%
    manufacturerShare: { type: Number, default: 45 }, // 45%
    organizationShare: { type: Number, default: 50 }, // 50%
    payoutDelayDays: { type: Number, default: 7 }, // 7 days dispute/refund window
    stripePublicKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' },
    stripeWebhookSecret: { type: String, default: '' },
    emailSettings: {
      smtpHost: { type: String, default: 'smtp.sendgrid.net' },
      smtpPort: { type: Number, default: 587 },
      senderEmail: { type: String, default: 'no-reply@sayrab.org' },
      notifyOnPayout: { type: Boolean, default: true },
      notifyOnVerification: { type: Boolean, default: true },
      notifyOnOrder: { type: Boolean, default: true },
    },
    taxRate: { type: Number, default: 0 },
    shippingProviders: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true },
        active: { type: Boolean, default: true },
      },
    ],
    manufacturerIntegrations: [
      {
        provider: { type: String, required: true },
        apiKey: { type: String, default: '' },
        endpoint: { type: String, default: '' },
        active: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('PlatformSettings', platformSettingsSchema);
