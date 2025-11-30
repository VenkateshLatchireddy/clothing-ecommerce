import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middleware - Updated for production
// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://clothing-ecommerce-dusky.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.warn('⚠️ CORS: Blocking request from origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Respond to preflight requests
app.options('*', cors({ origin: allowedOrigins }));

// Optional request logging for development and debug of production issues
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('📥 Incoming request:', req.method, req.url);
    next();
  });
}
// Log origin on each request for debugging CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) console.log('🔎 Incoming origin:', origin);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test DB connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      ping: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Root API route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Clothing E-commerce API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart', 
      orders: '/api/orders',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Use central connectDB so we can reuse the fallback settings in config/db.js

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  });
});

export default app;