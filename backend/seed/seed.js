import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import PlatformStats from '../models/PlatformStats.js';
import Organization from '../models/Organization.js';
import Manufacturer from '../models/Manufacturer.js';
import Techpack from '../models/Techpack.js';
import PlatformSettings from '../models/PlatformSettings.js';
import AdminNotification from '../models/AdminNotification.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Order from '../models/Order.js';
import SampleProduction from '../models/SampleProduction.js';
import { VERIFICATION_STATUS, LIFECYCLE_STATUS, USER_ROLES } from '../constants/index.js';
import { fileURLToPath } from 'url';
import { generateSlug, generateReferralCode } from '../utils/generateToken.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const seed = async () => {
  await connectDB();

  console.log('Clearing old database collections...');
  await Promise.all([
    User.deleteMany({}),
    Campaign.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    PlatformStats.deleteMany({}),
    Organization.deleteMany({}),
    Manufacturer.deleteMany({}),
    Techpack.deleteMany({}),
    PlatformSettings.deleteMany({}),
    AdminNotification.deleteMany({}),
    WithdrawalRequest.deleteMany({}),
    Order.deleteMany({}),
    SampleProduction.deleteMany({}),
  ]);

  console.log('Seeding Platform Settings...');
  const settings = await PlatformSettings.create({
    platformCommission: 5,
    manufacturerShare: 45,
    organizationShare: 50,
    payoutDelayDays: 7,
    stripePublicKey: 'pk_live_51Mz0SayrabProductionKey2026',
    stripeSecretKey: 'sk_live_SayrabSecKey2026',
    stripeWebhookSecret: 'whsec_SayrabWebhookSec2026',
    emailSettings: {
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      senderEmail: 'admin@sayrab.org',
      notifyOnPayout: true,
      notifyOnVerification: true,
      notifyOnOrder: true,
    },
    taxRate: 0,
    shippingProviders: [
      { name: 'TCS Express Logistics', code: 'TCS', active: true },
      { name: 'Leopards Courier Service', code: 'LCS', active: true },
      { name: 'Trax Logistics', code: 'TRAX', active: true },
    ],
  });

  console.log('Seeding Users...');
  const admin = await User.create({
    fullName: 'Sayrab Platform Admin',
    name: 'Sayrab Platform Admin',
    email: 'admin@sayrab.com',
    password: 'password123',
    phone: '+923000000000',
    role: USER_ROLES.ADMIN,
    status: 'active',
    isVerifiedFundraiser: true,
  });

  const leader1 = await User.create({
    fullName: 'Dr. Tariq Mehmood',
    name: 'Dr. Tariq Mehmood',
    email: 'tariq@alkhidmat.org',
    password: 'password123',
    phone: '+923001112233',
    role: USER_ROLES.ORG_LEADER,
    status: 'active',
    isVerifiedFundraiser: true,
  });

  const leader2 = await User.create({
    fullName: 'Amina Baloch',
    name: 'Amina Baloch',
    email: 'amina@sindhhope.org',
    password: 'password123',
    phone: '+923334445566',
    role: USER_ROLES.ORG_LEADER,
    status: 'active',
    isVerifiedFundraiser: true,
  });

  const fundraiser = await User.create({
    fullName: 'Ahmed Hassan',
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    password: 'password123',
    phone: '+923001234567',
    role: USER_ROLES.FUNDRAISER,
    status: 'active',
    cnic: '35202-1234567-1',
    address: 'Lahore, Pakistan',
    isVerifiedFundraiser: true,
    referralCode: generateReferralCode('ahmed'),
  });

  const donor = await User.create({
    fullName: 'Sara Khan',
    name: 'Sara Khan',
    email: 'sara@example.com',
    password: 'password123',
    phone: '+923007654321',
    role: USER_ROLES.DONOR,
    status: 'active',
    referralCode: generateReferralCode('sara'),
  });

  console.log('Seeding Organizations...');
  const org1 = await Organization.create({
    name: 'Al-Khidmat Relief Foundation',
    slug: 'al-khidmat-relief',
    category: 'Disaster Relief & Welfare',
    description: 'National humanitarian relief and healthcare support network across Pakistan.',
    logo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
    leader: leader1._id,
    contactEmail: 'contact@alkhidmat.org',
    phone: '+923001112233',
    address: 'Lahore, Punjab, Pakistan',
    website: 'https://alkhidmat.org',
    registrationNumber: 'REG-PK-2018-9941',
    taxId: 'NTN-8849120',
    status: 'verified',
    verifiedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
    documents: [
      { title: 'Tax Exemption Certificate.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'application/pdf', uploadedAt: new Date() },
      { title: 'Social Welfare Registration.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'application/pdf', uploadedAt: new Date() },
    ],
    bankDetails: { bankName: 'Meezan Bank', accountHolderName: 'Al-Khidmat Foundation', accountNumber: '01029384756', iban: 'PK36MEZN0001029384756' },
    totalRevenue: 3850000,
    totalRaised: 3450000,
    pendingPayoutBalance: 450000,
    paidOutAmount: 3000000,
  });

  const org2 = await Organization.create({
    name: 'Sindh Hope Education Society',
    slug: 'sindh-hope-education',
    category: 'Education / Student Fees',
    description: 'Providing primary education, books, and uniforms to underprivileged children in rural Sindh.',
    logo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80',
    leader: leader2._id,
    contactEmail: 'info@sindhhope.org',
    phone: '+923334445566',
    address: 'Sukkur, Sindh, Pakistan',
    website: 'https://sindhhope.org',
    registrationNumber: 'REG-SD-2023-4102',
    taxId: 'NTN-7341902',
    status: 'pending',
    documents: [
      { title: 'NGO Registration Certificate.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'application/pdf', uploadedAt: new Date() },
    ],
    bankDetails: { bankName: 'Habib Bank Limited', accountHolderName: 'Sindh Hope Society', accountNumber: '12938475610', iban: 'PK45HABB00012938475610' },
    totalRevenue: 750000,
    totalRaised: 750000,
    pendingPayoutBalance: 375000,
    paidOutAmount: 0,
  });

  const mfg1 = await Manufacturer.create({
    name: 'Apex Textile & Apparel Mills',
    companyName: 'Apex Textiles Ltd.',
    contactPerson: 'Zubair Qureshi',
    email: 'manufacturer@sayrab.com',
    phone: '+923215556677',
    address: 'SITE Industrial Area, Karachi, Pakistan',
    specialties: ['Apparel', 'T-Shirts', 'Hoodies', 'Polo Shirts'],
    capacityPerMonth: 25000,
    activeOrdersCount: 12,
    status: 'active',
    performance: { onTimeDeliveryRate: 98.4, qualityScore: 4.9, totalCompletedOrders: 312 },
  });

  const manufacturerUser = await User.create({
    fullName: 'Zubair Qureshi (Apex TexCraft)',
    name: 'Zubair Qureshi',
    email: 'manufacturer@sayrab.com',
    password: 'password123',
    phone: '+923215556677',
    role: USER_ROLES.MANUFACTURER,
    status: 'active',
    manufacturerId: mfg1._id,
    isVerifiedFundraiser: true,
  });

  const mfg2 = await Manufacturer.create({
    name: 'Lahore Print & Merch Solutions',
    companyName: 'Lahore Merch Hub',
    contactPerson: 'Sarmad Ali',
    email: 'sarmad@lahoremerch.pk',
    phone: '+923008889900',
    address: 'Gulberg Industrial Estate, Lahore, Pakistan',
    specialties: ['Drinkware', 'Stationery', 'Accessories', 'Caps', 'Mugs'],
    capacityPerMonth: 15000,
    activeOrdersCount: 5,
    status: 'active',
    performance: { onTimeDeliveryRate: 95.2, qualityScore: 4.7, totalCompletedOrders: 189 },
  });

  console.log('Seeding Campaigns...');
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 15);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 45);

  const campaign1 = await Campaign.create({
    title: 'Emergency Heart Surgery for Zainab',
    slug: generateSlug('Emergency Heart Surgery for Zainab'),
    category: 'Medical Assistance',
    shortDescription: 'Help 8-year-old Zainab receive urgent cardiac surgery she desperately needs.',
    location: 'Karachi, Pakistan',
    fundingGoal: 1500000,
    goalAmount: 1500000,
    amountRaised: 875000,
    raisedAmount: 875000,
    purposeOfFunds: 'Heart surgery, hospital stay, and post-operative care',
    isFeatured: true,
    isEmergency: true,
    urgencyScore: 95,
    donorCount: 142,
    shareCount: 89,
    viewCount: 2340,
    organizer: fundraiser._id,
    organization: org1._id,
    startDate,
    endDate,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    lifecycleStatus: LIFECYCLE_STATUS.ACTIVE,
    status: 'active',
    thumbnail: 'https://picsum.photos/seed/zainab/600/400',
  });

  const campaign2 = await Campaign.create({
    title: 'Flood Relief for Swat Valley Families',
    slug: generateSlug('Flood Relief for Swat Valley Families'),
    category: 'Disaster Relief',
    shortDescription: 'Providing food, shelter, and medical aid to families displaced by recent floods.',
    location: 'Swat, KPK',
    fundingGoal: 2000000,
    goalAmount: 2000000,
    amountRaised: 1200000,
    raisedAmount: 1200000,
    purposeOfFunds: 'Food packages, temporary shelter, medical supplies',
    isFeatured: true,
    isEmergency: true,
    urgencyScore: 90,
    donorCount: 256,
    shareCount: 178,
    viewCount: 4520,
    organizer: leader1._id,
    organization: org1._id,
    startDate,
    endDate,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    lifecycleStatus: LIFECYCLE_STATUS.ACTIVE,
    status: 'active',
    thumbnail: 'https://picsum.photos/seed/flood/600/400',
  });

  console.log('Seeding Products...');
  const p1 = await Product.create({
    name: 'Sayrab Logo T-Shirt',
    slug: generateSlug('Sayrab Logo T-Shirt'),
    category: 'Apparel',
    price: 1499,
    description: 'Premium cotton tee with Sayrab branding.',
    image: 'https://picsum.photos/seed/tshirt/400/400',
    stock: 100,
    campaignId: campaign1._id,
  });

  const p2 = await Product.create({
    name: 'Charity Hoodie',
    slug: generateSlug('Charity Hoodie'),
    category: 'Apparel',
    price: 3499,
    description: 'Warm hoodie supporting emergency campaigns.',
    image: 'https://picsum.photos/seed/hoodie/400/400',
    stock: 100,
    campaignId: campaign2._id,
  });

  console.log('Seeding Orders & Revenue Split...');
  const order1 = await Order.create({
    invoiceNumber: 'INV-2026-00101',
    customerId: donor._id,
    campaignId: campaign2._id,
    products: [{ productId: p2._id, name: p2.name, quantity: 2, price: p2.price, size: 'L', color: 'Black' }],
    total: 6998,
    paymentStatus: 'paid',
    orderStatus: 'production',
    productionStatus: 'in_production',
    assignedManufacturer: mfg1._id,
    carrier: 'TCS Express Logistics',
    trackingNumber: 'TCS-9921049182',
    revenueSplit: { organization: 3499, sayrab: 349.9, manufacturer: 3149.1 },
    shippingAddress: { fullName: 'Sara Khan', phone: '+923007654321', line1: 'House 14-B, Street 9', city: 'Islamabad', postalCode: '44000', country: 'Pakistan' },
    stripeSessionId: 'cs_test_a1b2c3',
    paymentIntentId: 'pi_3MtwxTLkdIwHu7ix28a30bgh',
  });

  console.log('Seeding Withdrawal Requests (Payouts)...');
  await WithdrawalRequest.create({
    organization: org1._id,
    campaign: campaign2._id,
    accountHolderName: 'Al-Khidmat Foundation',
    bankName: 'Meezan Bank Ltd',
    accountNumber: '01029384756',
    iban: 'PK36MEZN0001029384756',
    totalRevenue: 1000000,
    platformFee: 50000,
    manufacturerShare: 450000,
    organizationShare: 500000,
    amount: 500000,
    status: 'pending_review',
    requestedDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    eligiblePayoutDate: new Date(Date.now() - 8 * 24 * 3600 * 1000),
    adminNote: 'Campaign completed. Ready for transfer.',
  });

  console.log('Seeding Techpacks...');
  await Techpack.create({
    title: 'Sayrab Classic Charity Hoodie 2026',
    campaign: campaign2._id,
    product: p2._id,
    designer: fundraiser._id,
    version: '2.1',
    files: [{ name: 'Hoodie_Techpack_Spec_v2.1.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'application/pdf', size: 2450000 }],
    previewImages: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80'],
    materials: ['320 GSM Brushed Fleece Cotton', 'Screenprinted Emblem'],
    status: 'approved',
    assignedManufacturer: mfg1._id,
    adminNotes: 'Approved for production.',
    reviewedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
  });

  console.log('Seeding Admin Notifications...');
  await AdminNotification.create({
    type: 'verification_request',
    title: 'New Organization Verification Request',
    message: 'Sindh Hope Education Society has submitted verification documents for approval.',
    link: '/admin/organizations?status=pending',
    severity: 'warning',
    isRead: false,
  });

  console.log('Seeding PlatformStats...');
  await PlatformStats.create({
    totalFundsRaised: 6113000,
    totalCampaignsSupported: 8,
    totalDonors: 1066,
    emergencyCampaignsFunded: 3,
  });

  console.log('Seed completed successfully!');
  console.log('Real MongoDB Documents created:');
  console.log('  Admin User: admin@sayrab.com / password123');
  console.log('  Fundraiser: ahmed@example.com / password123');
  console.log('  Donor: sara@example.com / password123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
