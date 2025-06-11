import type { Request, Response } from 'express';
import { AppDataSource } from '../config/database.ts';
import { Listing } from '../entities/Listing.ts';
import { User } from '../entities/User.ts';
import { Agent } from '../entities/Agent.ts';
import { AppError } from '../middleware/error.middleware.ts';
import { LucidService } from '../services/lucid.ts';
import { Logger } from '../utils/logger.ts';

const listingRepository = AppDataSource.getRepository(Listing);
const userRepository = AppDataSource.getRepository(User);
const agentRepository = AppDataSource.getRepository(Agent);
const logger = new Logger('ListingController');

export class ListingController {
  private lucidService: LucidService | null = null;

  constructor() {
    this.initializeLucid();
  }

  private async initializeLucid() {
    try {
      this.lucidService = await LucidService.getInstance();
    } catch (error) {
      logger.error('Failed to initialize LucidService:', error);
    }
  }

  async createListing(req: Request, res: Response) {
    try {
      if (!this.lucidService) {
        await this.initializeLucid();
        if (!this.lucidService) {
          throw new AppError('LucidService not initialized', 500, 'SERVICE_NOT_INITIALIZED');
        }
      }

      const { agentId, price, duration, modelMetadata, title, description, assetId, ownerAddress } = req.body;
      const sellerId = (req as any).user.id;

      const seller = await userRepository.findOne({ where: { id: sellerId } });
      if (!seller) {
        throw new AppError('Seller not found', 404, 'SELLER_NOT_FOUND');
      }

      const agent = await agentRepository.findOne({ where: { id: agentId } });
      if (!agent) {
        throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
      }

      // Create the listing first
      const listing = listingRepository.create({
        seller,
        agent,
        price: BigInt(price),
        duration,
        modelMetadata,
        title,
        description,
        assetId,
        ownerAddress,
        status: 'pending',
        metadataUri: '', // Will be updated after upload
        isActive: false
      });

      // Save the listing to get an ID
      await listingRepository.save(listing);

      try {
        // Create the transaction with metadata upload
        const txHash = await this.lucidService.createListing(listing, seller);
        
        // Update the listing with the transaction hash
        listing.txHash = txHash;
        listing.status = 'pending';
        await listingRepository.save(listing);

        res.status(201).json({
          listing,
          message: 'Listing created successfully. Transaction submitted for confirmation.'
        });
      } catch (error) {
        // If the transaction fails, update the listing status
        listing.status = 'cancelled';
        await listingRepository.save(listing);
        logger.error('Failed to create listing transaction:', error);
        throw new AppError('Failed to create listing transaction', 500, 'TRANSACTION_FAILED');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error creating listing:', error);
      throw new AppError('Failed to create listing', 500, 'LISTING_CREATION_FAILED');
    }
  }

  async getListing(req: Request, res: Response) {
    const { id } = req.params;
    const listing = await listingRepository.findOne({
      where: { id },
      relations: ['seller', 'agent']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    res.json(listing);
  }

  async updateListing(req: Request, res: Response) {
    const { id } = req.params;
    const sellerId = (req as any).user.id;
    const { price, duration, status } = req.body;

    const listing = await listingRepository.findOne({
      where: { id, seller: { id: sellerId } },
      relations: ['seller']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    if (price) listing.price = BigInt(price);
    if (duration) listing.duration = duration;
    if (status) listing.status = status;

    await listingRepository.save(listing);
    res.json(listing);
  }

  async deleteListing(req: Request, res: Response) {
    const { id } = req.params;
    const sellerId = (req as any).user.id;

    const listing = await listingRepository.findOne({
      where: { id, seller: { id: sellerId } },
      relations: ['seller']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    await listingRepository.remove(listing);
    res.status(204).send();
  }

  async listListings(req: Request, res: Response) {
    const listings = await listingRepository.find({
      relations: ['seller', 'agent'],
      order: { createdAt: 'DESC' }
    });
    res.json(listings);
  }
} 