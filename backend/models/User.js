import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required() {
        return !this.googleId;
      },
      minlength: 6,
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    cnic: { type: String, trim: true },
    address: { type: String, trim: true },
    profilePicture: { type: String, default: '' },
    notificationPreferences: {
      donationUpdates: { type: Boolean, default: true },
      campaignUpdates: { type: Boolean, default: true },
      verificationNotifications: { type: Boolean, default: true },
      storeNotifications: { type: Boolean, default: true },
    },
    identityDocuments: [{ filename: String, url: String, uploadedAt: Date }],
    isVerifiedFundraiser: { type: Boolean, default: false },
    referralCode: { type: String, unique: true, sparse: true },
    referralPrivacy: {
      type: String,
      enum: ['public', 'anonymous'],
      default: 'public',
    },
  },
  { timestamps: true }
);

userSchema.pre('validate', function (next) {
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name || this.fullName,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    cnic: this.cnic,
    address: this.address,
    profilePicture: this.profilePicture,
    notificationPreferences: this.notificationPreferences || {
      donationUpdates: true,
      campaignUpdates: true,
      verificationNotifications: true,
      storeNotifications: true,
    },
    isVerifiedFundraiser: this.isVerifiedFundraiser,
    referralCode: this.referralCode,
    referralPrivacy: this.referralPrivacy,
    authProvider: this.authProvider,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
