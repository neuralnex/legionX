import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';
import { dbSyncService } from './config/dbsync';
import { LucidService } from './services/lucid';
import { FeeService } from './services/fee.service';
import { Logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import purchaseRoutes from './routes/purchase.routes';
import accessRoutes from './routes/access.routes';
import premiumRoutes from './routes/premium.routes';
//import ipfsRoutes from './routes/ipfs.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { responseWrapper } from './middleware/response.middleware';

// Load environment variables
config();

const app = express();
const logger = new Logger('Index');
// const lucidService = new LucidService();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'https://legion-x.vercel.app', 'https://legion-x-yvut.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
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
app.use(responseWrapper);

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
//app.use('/api/v1/ipfs', ipfsRoutes);

// Error handling
app.use(errorHandler);

async function initializeApp() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    // Initialize DBSync
    await dbSyncService.initialize();
    logger.info('DBSync connection established');
    
    // Start express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      await AppDataSource.destroy();
      await dbSyncService.close();
      logger.info('DBSync connection closed');
      logger.info('Server closed');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      await AppDataSource.destroy();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error initializing app:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp(); 