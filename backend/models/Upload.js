import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number },
    category: {
      type: String,
      enum: ['campaign_asset', 'merchandise_asset'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Upload', uploadSchema);
