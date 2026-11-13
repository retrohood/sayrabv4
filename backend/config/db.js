import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS resolvers reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

mongoose.set('bufferCommands', true);

let reconnectTimer = null;

const startBackgroundReconnect = (uri) => {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
      return;
    }
    try {
      try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log('✅ MongoDB connected successfully!');
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    } catch (_) {}
  }, 4000);
  reconnectTimer.unref();
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Attempting reconnection...');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (uri) startBackgroundReconnect(uri);
});

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Missing MongoDB URI. Set MONGO_URI or MONGODB_URI in backend/.env.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      if (attempt === retries) {
        startBackgroundReconnect(uri);
        throw err;
      }
      console.warn(`MongoDB connection attempt ${attempt} failed (${err.message}). Retrying in 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

export default connectDB;
