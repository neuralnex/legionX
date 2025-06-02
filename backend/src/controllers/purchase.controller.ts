import type { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Purchase } from '../entities/Purchase.js';
import { Listing } from '../entities/Listing.ts';
import { User } from '../entities/User.ts';
import { AppError } from '../middleware/error.middleware.ts';
import { LucidService } from '../services/lucid.js';
import { Logger } from '../utils/logger.ts';
import { config } from 'dotenv';

const purchaseRepository = AppDataSource.getRepository(Purchase);
const listingRepository = AppDataSource.getRepository(Listing);
const userRepository = AppDataSource.getRepository(User);

export class PurchaseController {
  private lucidService: LucidService | null = null;
  private logger: Logger;

  constructor() {
    config(); // Load environment variables
    this.initializeLucid();
    this.logger = new Logger('PurchaseController');
  }

  private async initializeLucid() {
    this.lucidService = await LucidService.getInstance();
  }

  async createPurchase(req: Request, res: Response) {
    try {
      if (!this.lucidService) {
        throw new Error('LucidService not initialized');
      }
    const { listingId } = req.body;
    const buyerId = (req as any).user.id;

    const listing = await listingRepository.findOne({
      where: { id: listingId },
      relations: ['seller']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    const buyer = await userRepository.findOne({
      where: { id: buyerId }
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404, 'BUYER_NOT_FOUND');
    }

    const purchase = purchaseRepository.create({
      buyer,
      listing,
      amount: listing.price,
      status: 'pending'
    });

    await purchaseRepository.save(purchase);

    // Create blockchain transaction
      const txHash = await this.lucidService.createPurchase(purchase, buyer);
      purchase.txHash = txHash;
      await purchaseRepository.save(purchase);

      res.status(201).json(purchase);
    } catch (error) {
      this.logger.error('Error creating purchase transaction:', error);
      throw new AppError('Failed to create purchase transaction', 500, 'TRANSACTION_FAILED');
    }
  }

  async getPurchase(req: Request, res: Response) {
    const { id } = req.params;
    const purchase = await purchaseRepository.findOne({
      where: { id },
      relations: ['buyer', 'listing', 'listing.seller']
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404, 'PURCHASE_NOT_FOUND');
    }

    res.json(purchase);
  }

  async updatePurchase(req: Request, res: Response) {
    const { id } = req.params;
    const buyerId = (req as any).user.id;
    const { status, txHash, confirmations } = req.body;

    const purchase = await purchaseRepository.findOne({
      where: { id, buyer: { id: buyerId } },
      relations: ['buyer']
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404, 'PURCHASE_NOT_FOUND');
    }

    if (status) purchase.status = status;
    if (txHash) purchase.txHash = txHash;
    if (confirmations) purchase.confirmations = confirmations;

    await purchaseRepository.save(purchase);
    res.json(purchase);
  }

  async listPurchases(req: Request, res: Response) {
    const buyerId = (req as any).user.id;
    const purchases = await purchaseRepository.find({
      where: { buyer: { id: buyerId } },
      relations: ['listing', 'listing.seller'],
      order: { createdAt: 'DESC' }
    });
    res.json(purchases);
  }
} 