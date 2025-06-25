import type { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { Listing } from '../entities/Listing.js';
import { Purchase } from '../entities/Purchase.js';
import { AppError } from '../middleware/error.middleware.js';
import { Logger } from '../utils/logger.js';
import { FlutterwaveService } from '../services/flutterwave.js';
import { LucidService } from '../services/lucid.js';

const userRepository = AppDataSource.getRepository(User);
const listingRepository = AppDataSource.getRepository(Listing);
const purchaseRepository = AppDataSource.getRepository(Purchase);
const logger = new Logger('PaymentController');
const flutterwaveService = new FlutterwaveService();

export class PaymentController {
  /**
   * Initiate a purchase for listing points
   * Body: { points: number }
   */
  static async buyListingPoints(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { points } = req.body;
      if (!points || points < 1) {
        throw new AppError('Invalid points amount', 400, 'INVALID_POINTS');
      }
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      // Initiate Flutterwave payment (1 point = $1)
      const paymentLink = await flutterwaveService.initiatePayment({
        amount: points,
        currency: 'USD',
        email: user.email,
        userId: user.id,
        purpose: 'listing_points',
        points
      });
      res.json({ paymentLink });
    } catch (error: any) {
      logger.error('Error initiating listing points purchase:', error);
      res.status(400).json({ error: error.message || 'Failed to initiate payment' });
    }
  }

  /**
   * Initiate a purchase for an agent or model
   * Body: { listingId }
   */
  static async initiatePurchase(req: Request, res: Response) {
    try {
      const buyerId = (req as any).user.id;
      const { listingId } = req.body;
      if (!listingId) {
        throw new AppError('Listing ID is required', 400, 'MISSING_LISTING_ID');
      }
      const listing = await listingRepository.findOne({ where: { id: listingId }, relations: ['seller'] });
      if (!listing) {
        throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
      }
      const buyer = await userRepository.findOne({ where: { id: buyerId } });
      if (!buyer) {
        throw new AppError('Buyer not found', 404, 'BUYER_NOT_FOUND');
      }
      // Initiate Flutterwave payment for the listing price (USD)
      const paymentLink = await flutterwaveService.initiatePayment({
        amount: Number(listing.price),
        currency: 'USD',
        email: buyer.email,
        userId: buyer.id,
        purpose: 'purchase',
        meta: {
          listingId: listing.id,
          sellerId: listing.seller.id,
          itemType: listing.agent ? 'agent' : 'model',
          accessType: typeof listing.modelMetadata === 'object' && listing.modelMetadata && 'accessType' in listing.modelMetadata ? (listing.modelMetadata as any).accessType : 'lifetime'
        }
      });
      res.json({ paymentLink });
    } catch (error: any) {
      logger.error('Error initiating purchase:', error);
      res.status(400).json({ error: error.message || 'Failed to initiate purchase' });
    }
  }

  /**
   * Flutterwave webhook for payment confirmation
   */
  static async flutterwaveWebhook(req: Request, res: Response) {
    try {
      const event = req.body;
      const isValid = flutterwaveService.validateWebhook(req);
      if (!isValid) {
        logger.warn('Invalid Flutterwave webhook signature');
        return res.status(400).send('Invalid signature');
      }
      if (event.event === 'charge.completed' && event.data.status === 'successful') {
        const meta = event.data.meta;
        // Listing points purchase
        if (meta.purpose === 'listing_points') {
          const { userId, points } = meta;
          const user = await userRepository.findOne({ where: { id: userId } });
          if (user && points) {
            user.listingPoints += Number(points);
            await userRepository.save(user);
            logger.info(`Credited ${points} listing points to user ${user.email}`);
          }
        }
        // Agent/model purchase
        if (meta.purpose === 'purchase') {
          const { userId, listingId, itemType, accessType } = meta;
          const buyer = await userRepository.findOne({ where: { id: userId } });
          const listing = await listingRepository.findOne({ where: { id: listingId }, relations: ['seller'] });
          if (!buyer || !listing) {
            logger.error('Buyer or listing not found for purchase');
            return res.status(400).send('Buyer or listing not found');
          }
          // Create a purchase record
          const purchase = purchaseRepository.create({
            buyer,
            listing,
            price: listing.price,
            amount: listing.price,
            status: 'pending'
          });
          await purchaseRepository.save(purchase);
          // Blockchain action
          const lucidService = await LucidService.getInstance();
          try {
            const txHash = await lucidService.createPurchase(purchase, buyer);
            purchase.txHash = txHash;
            purchase.status = 'completed';
            await purchaseRepository.save(purchase);
            logger.info(`NFT transfer/access grant complete. TxHash: ${txHash}`);
            // For models, handle access grant/subscription
            if (itemType === 'model') {
              if (accessType === 'subscription') {
                // Set subscription expiry (e.g., 30 days from now)
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                purchase.subscriptionExpiry = expiry;
                await purchaseRepository.save(purchase);
              }
              // For lifetime, no expiry needed
            }
            // For agents, NFT transfer is handled by smart contract
          } catch (err) {
            logger.error('Blockchain action failed:', err);
            purchase.status = 'failed';
            await purchaseRepository.save(purchase);
            return res.status(500).send('Blockchain action failed');
          }
        }
      }
      res.status(200).send('OK');
    } catch (error: any) {
      logger.error('Error handling Flutterwave webhook:', error);
      res.status(500).send('Webhook error');
    }
  }
} 