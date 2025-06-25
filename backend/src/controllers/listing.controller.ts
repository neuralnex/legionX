import type { Request, Response } from 'express';
import { AppDataSource } from '../config/database.ts';
import { Listing } from '../entities/Listing.ts';
import { User } from '../entities/User.ts';
import { Agent } from '../entities/Agent.ts';
import { AppError } from '../middleware/error.middleware.ts';
import { LucidService } from '../services/lucid.ts';
import { Logger } from '../utils/logger.ts';
import { PinataService } from '../services/pinata.ts';

const listingRepository = AppDataSource.getRepository(Listing);
const userRepository = AppDataSource.getRepository(User);
const agentRepository = AppDataSource.getRepository(Agent);
const logger = new Logger('ListingController');
const pinataService = new PinataService();

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

  // New method for creating listings with IPFS integration
  async createListingWithIPFS(req: Request, res: Response) {
    try {
      const { type, name, description, price, metadata, files } = req.body;
      const sellerId = (req as any).user.id;

      const seller = await userRepository.findOne({ where: { id: sellerId } });
      if (!seller) {
        throw new AppError('Seller not found', 404, 'SELLER_NOT_FOUND');
      }

      // Check if user has at least 1 listing point
      if (!seller.listingPoints || seller.listingPoints < 1) {
        throw new AppError('Insufficient listing points. Please purchase more points to list.', 400, 'INSUFFICIENT_LISTING_POINTS');
      }

      let ipfsHash = null;
      let listingData: any = {
        title: name,
        description,
        price: BigInt(Math.floor(parseFloat(price) * 1000000)), // Convert to Lovelace
        type, // 'agent' or 'model'
        seller,
        status: 'active',
        isActive: true
      };

      // Handle IPFS upload for core files
      if (files && files.length > 0) {
        try {
          // Upload files to IPFS using PinataService
          const fileBuffers = files.map((file: any) => Buffer.from(file.data));
          const fileNames = files.map((file: any) => file.name);
          
          const uploadPromises = fileBuffers.map((buffer: Buffer, index: number) =>
            pinataService.uploadFile(buffer, fileNames[index])
          );
          
          const uploadResults = await Promise.all(uploadPromises);
          ipfsHash = uploadResults[0].cid; // Use first file's CID as main hash
          listingData.metadataUri = `ipfs://${ipfsHash}`;
          
          logger.info(`Files uploaded to IPFS for listing ${name}: ${ipfsHash}`);
        } catch (error) {
          logger.error('IPFS upload failed:', error);
          throw new AppError('Failed to upload files to IPFS', 500, 'IPFS_UPLOAD_FAILED');
        }
      }

      // Store metadata based on type
      if (type === 'agent') {
        listingData.modelMetadata = {
          name: name,
          description: description,
          setupDoc: metadata.setupDoc,
          dependencies: metadata.dependencies || [],
          abilities: metadata.abilities || [],
          modelType: metadata.modelType || 'custom',
          version: metadata.version || '1.0.0',
          requirements: {
            minMemory: metadata.minMemory || 4,
            minStorage: metadata.minStorage || 1,
            dependencies: metadata.dependencies || []
          }
        };
      } else if (type === 'model') {
        listingData.modelMetadata = {
          name: name,
          description: description,
          url: metadata.url,
          version: metadata.version,
          modelType: metadata.type,
          subscriptionType: metadata.subscriptionType,
          pricing: {
            lifetime: parseFloat(metadata.priceLifetime) || 0,
            monthly: parseFloat(metadata.priceMonthly) || 0,
            yearly: parseFloat(metadata.priceYearly) || 0
          },
          supportedTasks: metadata.tasks || [],
          apiEndpoint: metadata.url
        };
      }

      // Create the listing
      const listing = listingRepository.create(listingData);
      await listingRepository.save(listing);

      // Deduct 1 point from user
      seller.listingPoints -= 1;
      await userRepository.save(seller);

      logger.info(`Listing created with IPFS: ${listing.id} by user ${sellerId}`);

      res.status(201).json({
        success: true,
        data: {
          listing: {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price.toString(),
            type: listing.type,
            ipfsHash: ipfsHash,
            metadataUri: listing.metadataUri,
            status: listing.status,
            createdAt: listing.createdAt
          }
        },
        message: 'Listing created successfully'
      });

    } catch (error) {
      logger.error('Create listing with IPFS error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  // Get IPFS content URL
  async getIPFSContent(req: Request, res: Response) {
    try {
      const { ipfsHash } = req.params;

      if (!ipfsHash) {
        throw new AppError('IPFS hash is required', 400, 'IPFS_HASH_REQUIRED');
      }

      // Return the IPFS gateway URL for the content
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      res.json({
        success: true,
        data: {
          ipfsUrl,
          ipfsHash,
          gateway: 'https://gateway.pinata.cloud/ipfs/'
        }
      });

    } catch (error) {
      logger.error('Get IPFS content error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get IPFS content'
        });
      }
    }
  }

  // Get listings with pagination and filters
  async getListings(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, type, search, sortBy = 'newest' } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const queryBuilder = listingRepository
        .createQueryBuilder('listing')
        .leftJoinAndSelect('listing.seller', 'seller')
        .where('listing.isActive = :isActive', { isActive: true });

      // Apply filters
      if (type) {
        queryBuilder.andWhere('listing.type = :type', { type });
      }

      if (search) {
        queryBuilder.andWhere(
          '(listing.title ILIKE :search OR listing.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          queryBuilder.orderBy('listing.price', 'ASC');
          break;
        case 'price-high':
          queryBuilder.orderBy('listing.price', 'DESC');
          break;
        case 'oldest':
          queryBuilder.orderBy('listing.createdAt', 'ASC');
          break;
        default:
          queryBuilder.orderBy('listing.createdAt', 'DESC');
      }

      const [listings, total] = await queryBuilder
        .skip(skip)
        .take(parseInt(limit as string))
        .getManyAndCount();

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.json({
        success: true,
        data: {
          listings: listings.map((listing: any) => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price.toString(),
            type: listing.type,
            seller: {
              id: listing.seller.id,
              name: listing.seller.name,
              email: listing.seller.email
            },
            metadata: listing.modelMetadata,
            ipfsHash: listing.metadataUri ? listing.metadataUri.replace('ipfs://', '') : null,
            createdAt: listing.createdAt
          })),
          pagination: {
            currentPage: parseInt(page as string),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit as string)
          }
        }
      });

    } catch (error) {
      logger.error('Get listings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch listings'
      });
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

      // Check if user has at least 1 listing point
      if (!seller.listingPoints || seller.listingPoints < 1) {
        throw new AppError('Insufficient listing points. Please purchase more points to list.', 400, 'INSUFFICIENT_LISTING_POINTS');
      }

      // Deduct 1 listing point
      seller.listingPoints -= 1;
      await userRepository.save(seller);

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
        // If the transaction fails, update the listing status and refund the point
        listing.status = 'cancelled';
        await listingRepository.save(listing);
        seller.listingPoints += 1;
        await userRepository.save(seller);
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