import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.ts';
import listingRoutes from './routes/listing.routes.ts';
import purchaseRoutes from './routes/purchase.routes.ts';
import accessRoutes from './routes/access.routes.ts';
import premiumRoutes from './routes/premium.routes.ts';

// Import middleware
import { errorHandler } from './middleware/error.middleware.ts';
import { requestLogger } from './middleware/logger.middleware.ts';
import { responseWrapper } from './middleware/response.middleware.ts';

const app: Express = express();

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

// Error handling
app.use(errorHandler);

export { app }; 