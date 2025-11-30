import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const fallback = 'mongodb://localhost:27017/clothing-ecommerce';
    const mongoUri = process.env.MONGO_URI || fallback;
    if (!process.env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI not set; falling back to local MongoDB. Set MONGO_URI in your .env to avoid this warning.');
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;