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

      // Try to find existing agent, or create a new one if not found
      let agent = null;
      if (agentId) {
        agent = await agentRepository.findOne({ where: { id: parseInt(agentId) } });
      }
      
      // If no agent found, create a new one based on the modelMetadata
      if (!agent) {
        agent = agentRepository.create({
          name: modelMetadata.name || title,
          description: modelMetadata.description || description,
          modelVersion: modelMetadata.version || '1.0.0',
          metadataUri: '', // Will be updated after IPFS upload
          creator: seller
        });
        await agentRepository.save(agent);
        logger.info(`Created new agent with ID: ${agent.id}`);
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
        // Create unsigned transaction for user to sign
        const { tx, fee, listingFee } = await this.lucidService.createUnsignedListingTransaction(listing, seller);
        
        // Get the transaction hex for frontend signing
        const txHex = tx.toString();
        
        // Calculate total cost (listing fee + network fee)
        const totalCost = listingFee + fee;
        
        logger.info(`Created unsigned transaction. Listing fee: ${listingFee} lovelace, Network fee: ${fee} lovelace, Total: ${totalCost} lovelace`);

        res.status(200).json({
          listing,
          unsignedTransaction: txHex,
          fees: {
            listingFee: listingFee.toString(),
            networkFee: fee.toString(),
            totalCost: totalCost.toString()
          },
          message: 'Unsigned transaction created. Please sign with your wallet to complete the listing.'
        });
      } catch (error) {
        // If the transaction creation fails, update the listing status
        listing.status = 'cancelled';
        await listingRepository.save(listing);
        
        // Log the detailed error information
        logger.error('Failed to create unsigned listing transaction:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          listingId: listing.id,
          sellerId: seller.id,
          originalError: error
        });
        
        // Throw the original error with additional context
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new AppError(`Failed to create unsigned listing transaction: ${errorMessage}`, 500, 'TRANSACTION_FAILED', {
          originalError: errorMessage,
          listingId: listing.id,
          sellerId: seller.id
        });
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

  async submitSignedTransaction(req: Request, res: Response) {
    try {
      if (!this.lucidService) {
        await this.initializeLucid();
        if (!this.lucidService) {
          throw new AppError('LucidService not initialized', 500, 'SERVICE_NOT_INITIALIZED');
        }
      }

      const { id } = req.params;
      const { signedTransaction } = req.body;
      const sellerId = (req as any).user.id;

      if (!signedTransaction) {
        throw new AppError('Signed transaction is required', 400, 'MISSING_SIGNED_TRANSACTION');
      }

      const listing = await listingRepository.findOne({
        where: { id, seller: { id: sellerId } },
        relations: ['seller']
      });

      if (!listing) {
        throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
      }

      if (listing.status !== 'pending') {
        throw new AppError('Listing is not in pending status', 400, 'INVALID_LISTING_STATUS');
      }

      // Submit the signed transaction
      const txHash = await this.lucidService.submitSignedTransaction(signedTransaction);
      
      // Update the listing with the transaction hash and status
      listing.txHash = txHash;
      listing.status = 'active';
      listing.isActive = true;
      await listingRepository.save(listing);

      logger.info(`Listing ${id} activated with transaction hash: ${txHash}`);

      res.json({
        listing,
        txHash,
        message: 'Listing created successfully. Transaction submitted for confirmation.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error submitting signed transaction:', error);
      throw new AppError('Failed to submit signed transaction', 500, 'TRANSACTION_SUBMISSION_FAILED');
    }
  }
} 