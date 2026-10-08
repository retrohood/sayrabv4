import mongoose from 'mongoose';

const quotationMessageSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true,
    },
    fundraiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manufacturer',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ['fundraiser', 'manufacturer', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

quotationMessageSchema.index({ quotation: 1, createdAt: 1 });

export default mongoose.model('QuotationMessage', quotationMessageSchema);
