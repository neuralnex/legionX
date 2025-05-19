import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import purchaseRoutes from './routes/purchase.routes';
import accessRoutes from './routes/access.routes';
import premiumRoutes from './routes/premium.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic middleware
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/access', accessRoutes);
app.use('/api/v1/premium', premiumRoutes);

// Error handling
app.use(errorHandler);

// Initialize database connection
let server: any;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 