import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    projectName: { type: String, trim: true, default: 'Untitled quotation' },
    clientName: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    quoteContext: { type: mongoose.Schema.Types.Mixed, default: null },
    designSpec: { type: mongoose.Schema.Types.Mixed, required: true },
    calculation: { type: mongoose.Schema.Types.Mixed, required: true },
    versions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    status: {
      type: String,
      enum: ['draft', 'understanding', 'requirements_ready', 'configured', 'needs_review', 'price_calculated', 'review', 'final_quote', 'approved', 'payment_pending', 'paid', 'order_created', 'manual_review'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Quotation', quotationSchema);
