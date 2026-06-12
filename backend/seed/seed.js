import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import PlatformStats from '../models/PlatformStats.js';
import { VERIFICATION_STATUS, LIFECYCLE_STATUS } from '../constants/index.js';
import { generateSlug, generateReferralCode } from '../utils/generateToken.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Campaign.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    PlatformStats.deleteMany({}),
  ]);

  const fundraiser = await User.create({
    fullName: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    password: 'password123',
    phone: '+923001234567',
    role: 'fundraiser',
    cnic: '35202-1234567-1',
    address: 'Lahore, Pakistan',
    isVerifiedFundraiser: true,
    referralCode: generateReferralCode('ahmed'),
  });

  const donor = await User.create({
    fullName: 'Sara Khan',
    email: 'sara@example.com',
    password: 'password123',
    phone: '+923007654321',
    role: 'donor',
    referralCode: generateReferralCode('sara'),
  });

  const now = new Date();
  const campaigns = [
    {
      title: 'Emergency Heart Surgery for Zainab',
      category: 'Medical Assistance',
      shortDescription: 'Help 8-year-old Zainab receive urgent cardiac surgery she desperately needs.',
      location: 'Karachi, Pakistan',
      fundingGoal: 1500000,
      amountRaised: 875000,
      purposeOfFunds: 'Heart surgery, hospital stay, and post-operative care',
      isFeatured: true,
      isEmergency: true,
      urgencyScore: 95,
      donorCount: 142,
      shareCount: 89,
      viewCount: 2340,
      thumbnail: 'https://picsum.photos/seed/zainab/600/400',
    },
    {
      title: 'Flood Relief for Swat Valley Families',
      category: 'Disaster Relief',
      shortDescription: 'Providing food, shelter, and medical aid to families displaced by recent floods.',
      location: 'Swat, KPK',
      fundingGoal: 2000000,
      amountRaised: 1200000,
      purposeOfFunds: 'Food packages, temporary shelter, medical supplies',
      isFeatured: true,
      isEmergency: true,
      urgencyScore: 90,
      donorCount: 256,
      shareCount: 178,
      viewCount: 4520,
      thumbnail: 'https://picsum.photos/seed/flood/600/400',
    },
    {
      title: 'University Fees for Merit Student Ali',
      category: 'Education / Student Fees',
      shortDescription: 'Support Ali to complete his engineering degree at NUST.',
      location: 'Islamabad, Pakistan',
      fundingGoal: 500000,
      amountRaised: 320000,
      purposeOfFunds: 'Semester fees, books, and accommodation',
      isFeatured: true,
      donorCount: 67,
      shareCount: 34,
      viewCount: 890,
      thumbnail: 'https://picsum.photos/seed/ali/600/400',
    },
    {
      title: 'Small Bakery Startup for Widow Fatima',
      category: 'Small Business Support',
      shortDescription: 'Help Fatima establish a home bakery to support her three children.',
      location: 'Faisalabad, Pakistan',
      fundingGoal: 300000,
      amountRaised: 145000,
      purposeOfFunds: 'Equipment, ingredients, and shop setup',
      donorCount: 45,
      shareCount: 22,
      viewCount: 560,
      thumbnail: 'https://picsum.photos/seed/bakery/600/400',
    },
    {
      title: 'Monthly Ration Drive for Orphans',
      category: 'Food Distribution',
      shortDescription: 'Monthly food packages for 50 orphan children in Rawalpindi.',
      location: 'Rawalpindi, Pakistan',
      fundingGoal: 400000,
      amountRaised: 280000,
      purposeOfFunds: 'Monthly ration packs for 6 months',
      donorCount: 98,
      shareCount: 56,
      viewCount: 1200,
      thumbnail: 'https://picsum.photos/seed/ration/600/400',
    },
    {
      title: 'Community Water Well Project',
      category: 'Community Welfare',
      shortDescription: 'Building a clean water well for a village of 200 families in Thar.',
      location: 'Thar, Sindh',
      fundingGoal: 800000,
      amountRaised: 450000,
      purposeOfFunds: 'Well drilling, pump installation, maintenance fund',
      donorCount: 112,
      shareCount: 67,
      viewCount: 980,
      thumbnail: 'https://picsum.photos/seed/well/600/400',
    },
    {
      title: 'Rescue Injured Street Dogs',
      category: 'Animal Welfare',
      shortDescription: 'Medical treatment and shelter for injured stray dogs in Lahore.',
      location: 'Lahore, Pakistan',
      fundingGoal: 250000,
      amountRaised: 98000,
      purposeOfFunds: 'Vet bills, shelter rent, food supplies',
      donorCount: 34,
      shareCount: 19,
      viewCount: 420,
      thumbnail: 'https://picsum.photos/seed/dogs/600/400',
    },
    {
      title: 'Earthquake Relief Fund - Balochistan',
      category: 'Emergency Assistance',
      shortDescription: 'Immediate aid for earthquake-affected communities in Balochistan.',
      location: 'Balochistan, Pakistan',
      fundingGoal: 3000000,
      amountRaised: 1850000,
      purposeOfFunds: 'Emergency supplies, tents, medical teams',
      isEmergency: true,
      urgencyScore: 88,
      donorCount: 312,
      shareCount: 201,
      viewCount: 5600,
      thumbnail: 'https://picsum.photos/seed/earthquake/600/400',
    },
  ];

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 15);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 45);

  for (const data of campaigns) {
    await Campaign.create({
      ...data,
      slug: generateSlug(data.title),
      keywords: data.title.toLowerCase().split(' '),
      organizer: fundraiser._id,
      startDate,
      endDate,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      lifecycleStatus: LIFECYCLE_STATUS.ACTIVE,
      story: {
        background: `${data.title} was created to address an urgent need in our community.`,
        currentSituation: data.shortDescription,
        fundingNeed: `We need PKR ${data.fundingGoal.toLocaleString()} to achieve our goal.`,
        expectedImpact: 'Your donation will directly help those in need and create lasting positive change.',
        supportingEvidence: 'Supporting documents have been verified by our team.',
      },
    });
  }

  const products = [
    { name: 'Sayrab Logo T-Shirt', category: 'Apparel', price: 1499, description: 'Premium cotton tee with Sayrab branding.', image: 'https://picsum.photos/seed/tshirt/400/400' },
    { name: 'Sayrab Polo Shirt', category: 'Apparel', price: 1999, description: 'Classic polo for volunteers and supporters.', image: 'https://picsum.photos/seed/polo/400/400' },
    { name: 'Charity Hoodie', category: 'Apparel', price: 3499, description: 'Warm hoodie supporting emergency campaigns.', image: 'https://picsum.photos/seed/hoodie/400/400' },
    { name: 'Sayrab Cap', category: 'Apparel', price: 899, description: 'Adjustable cap with embroidered logo.', image: 'https://picsum.photos/seed/cap/400/400' },
    { name: 'Inspiration Mug', category: 'Drinkware', price: 699, description: 'Ceramic mug with motivational quote.', image: 'https://picsum.photos/seed/mug/400/400' },
    { name: 'Eco Water Bottle', category: 'Drinkware', price: 1299, description: 'Reusable stainless steel bottle.', image: 'https://picsum.photos/seed/bottle/400/400' },
    { name: 'Volunteer Notebook', category: 'Stationery', price: 499, description: 'A5 notebook for campaign planning.', image: 'https://picsum.photos/seed/notebook/400/400' },
    { name: 'Impact Journal', category: 'Stationery', price: 799, description: 'Leather-bound journal for reflections.', image: 'https://picsum.photos/seed/journal/400/400' },
    { name: 'Charity Tote Bag', category: 'Accessories', price: 999, description: 'Canvas tote bag for everyday use.', image: 'https://picsum.photos/seed/tote/400/400' },
    { name: 'Awareness Wristband', category: 'Accessories', price: 199, description: 'Silicone wristband supporting disaster relief.', image: 'https://picsum.photos/seed/wristband/400/400' },
    { name: 'Volunteer Kit', category: 'Event Merchandise', price: 2499, description: 'Complete kit for awareness campaign volunteers.', image: 'https://picsum.photos/seed/kit/400/400' },
  ];

  for (const p of products) {
    await Product.create({
      ...p,
      slug: generateSlug(p.name),
      stock: 100,
    });
  }

  await Review.create({
    author: fundraiser._id,
    campaign: (await Campaign.findOne({ title: 'Community Water Well Project' }))._id,
    campaignName: 'Community Water Well Project',
    rating: 5,
    feedback: 'Sayrab made it incredibly easy to raise funds for our village. The verification process gave donors confidence, and we exceeded our target!',
    isModerated: true,
    isPublished: true,
  });

  await PlatformStats.create({
    totalFundsRaised: 6113000,
    totalCampaignsSupported: 8,
    totalDonors: 1066,
    emergencyCampaignsFunded: 3,
  });

  console.log('Seed completed successfully!');
  console.log('Demo accounts:');
  console.log('  Fundraiser: ahmed@example.com / password123');
  console.log('  Donor: sara@example.com / password123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
