import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import productRoutes from './routes/productRoutes.js';
import designRoutes from './routes/designRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import manufacturingRoutes from './routes/manufacturingRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { CAMPAIGN_CATEGORIES, PRODUCT_CATEGORIES, SORT_OPTIONS } from './constants/index.js';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sayrab API is running' });
});

app.get('/api/constants', (req, res) => {
  res.json({
    campaignCategories: CAMPAIGN_CATEGORIES,
    productCategories: PRODUCT_CATEGORIES,
    sortOptions: Object.values(SORT_OPTIONS),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/products', productRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/webhook', webhookRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  let databaseConnected = false;

  try {
    await connectDB();
    databaseConnected = true;
  } catch (error) {
    console.warn('MongoDB unavailable:', error.message);
    console.warn('Starting in demo mode. Auth data will not be saved until MongoDB is connected.');
  }

  app.listen(PORT, () => {
    const mode = databaseConnected ? 'MongoDB connected' : 'demo mode';
    console.log(`Sayrab server running on port ${PORT} (${mode})`);
  });
};

start();
