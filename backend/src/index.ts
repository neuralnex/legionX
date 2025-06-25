import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database.ts';
import { Logger } from './utils/logger.ts';

// Import routes
import authRoutes from './routes/auth.routes.ts';
import listingRoutes from './routes/listing.routes.ts';
import purchaseRoutes from './routes/purchase.routes.ts';
import accessRoutes from './routes/access.routes.ts';
import premiumRoutes from './routes/premium.routes.ts';
import ipfsRoutes from './routes/ipfs.routes.ts';
import platformRoutes from './routes/platform.routes.ts';

// Import middleware
import { errorHandler } from './middleware/error.middleware.ts';
import { requestLogger } from './middleware/logger.middleware.ts';
import { responseWrapper } from './middleware/response.middleware.ts';

// Load environment variables
config();

const app = express();
const logger = new Logger('Index');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://legion-x.vercel.app', 
      'https://legion-x-yvut.vercel.app',
      'https://legionx.vercel.app',
      'https://legionx.onrender.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LegionX API'
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to LegionX API',
    version: '1.0.0',
    description: 'AI Agent Marketplace with Fiat Payments',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      listings: '/api/v1/listings',
      purchases: '/api/v1/purchases',
      access: '/api/v1/access',
      premium: '/api/v1/premium',
      ipfs: '/api/v1/ipfs',
      platform: '/api/v1/platform'
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/access', accessRoutes);
app.use('/api/v1/premium', premiumRoutes);
app.use('/api/v1/ipfs', ipfsRoutes);
app.use('/api/v1/platform', platformRoutes);

// Error handling
app.use(errorHandler);

async function initializeApp() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    // Start express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`🚀 LegionX API Server running on port ${PORT}`);
      logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
      logger.info(`🔗 API documentation available at http://localhost:${PORT}/`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      await AppDataSource.destroy();
      logger.info('Database connection closed');
      logger.info('Server shutdown complete');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      await AppDataSource.destroy();
      logger.info('Database connection closed');
      logger.info('Server shutdown complete');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error initializing app:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp(); 