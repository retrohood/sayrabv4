import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    specialties: [{ type: String, trim: true }],
    capacityPerMonth: { type: Number, default: 5000 },
    activeOrdersCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'busy', 'inactive'],
      default: 'active',
    },
    performance: {
      onTimeDeliveryRate: { type: Number, default: 95 },
      qualityScore: { type: Number, default: 4.8 },
      totalCompletedOrders: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Manufacturer', manufacturerSchema);
