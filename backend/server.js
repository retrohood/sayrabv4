import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { CAMPAIGN_CATEGORIES, PRODUCT_CATEGORIES, SORT_OPTIONS } from './constants/index.js';

dotenv.config();

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
app.use('/api/referrals', referralRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  try {
    // await connectDB();
    app.listen(PORT, () => {
      console.log(`Sayrab server running on port ${PORT} (Database disconnected for preview)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
