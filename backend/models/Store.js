import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    storeName: { type: String, required: true, trim: true },
    merchType: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Store', storeSchema);
