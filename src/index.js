import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// CORS Configuration for Production
const allowedOrigins = [
  process.env.FRONTEND_URL ,
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / Keep-alive endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date(),
    message: 'Backend is running'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hindustan Marble & Tiles Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});