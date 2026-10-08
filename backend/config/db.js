import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS resolvers reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Missing MongoDB URI. Set MONGO_URI or MONGODB_URI in backend/.env.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
};

export default connectDB;
