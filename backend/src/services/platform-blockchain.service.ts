import { LucidService } from './lucid.js';
import { NFTService } from './nft.service.js';
import { PinataService } from './pinata.js';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { Purchase } from '../entities/Purchase.js';
import { Listing } from '../entities/Listing.js';
import { Logger } from '../utils/logger.js';
import type { AIModelMetadata } from '../types/ai.js';

export class PlatformBlockchainService {
  private lucidService: LucidService | null = null;
  private nftService: NFTService;
  private pinataService: PinataService;
  private userRepository = AppDataSource.getRepository(User);
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private listingRepository = AppDataSource.getRepository(Listing);
  private logger: Logger;

  constructor() {
    this.nftService = new NFTService();
    this.pinataService = new PinataService();
    this.logger = new Logger('PlatformBlockchainService');
  }

  private async getLucidService(): Promise<LucidService> {
    if (!this.lucidService) {
      this.lucidService = await LucidService.getInstance();
    }
    return this.lucidService;
  }

  // Platform-managed listing creation for fiat users
  async createListingForUser(userEmail: string, listingData: {
    title: string;
    description: string;
    price: number;
    type: 'agent' | 'model';
    metadata: AIModelMetadata;
    files?: Array<{ data: string; name: string }>;
  }): Promise<{
    success: boolean;
    listingId?: string;
    assetId?: string;
    ipfsHash?: string;
    error?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userEmail }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Check listing points
      if (!user.listingPoints || user.listingPoints < 1) {
        return { success: false, error: 'Insufficient listing points' };
      }

      let ipfsHash = null;

      // Upload files to IPFS if provided
      if (listingData.files && listingData.files.length > 0) {
        try {
          const fileBuffers = listingData.files.map(file => Buffer.from(file.data));
          const fileNames = listingData.files.map(file => file.name);
          
          const uploadPromises = fileBuffers.map((buffer, index) =>
            this.pinataService.uploadFile(buffer, fileNames[index])
          );
          
          const uploadResults = await Promise.all(uploadPromises);
          ipfsHash = uploadResults[0].cid;
          
          this.logger.info(`Files uploaded to IPFS: ${ipfsHash}`);
        } catch (error) {
          this.logger.error('IPFS upload failed:', error);
          return { success: false, error: 'Failed to upload files' };
        }
      }

      // Create listing in database
      const listing = this.listingRepository.create({
        title: listingData.title,
        description: listingData.description,
        price: BigInt(Math.floor(listingData.price * 1000000)), // Convert to Lovelace
        type: listingData.type,
        seller: user,
        status: 'active',
        isActive: true,
        metadataUri: ipfsHash ? `ipfs://${ipfsHash}` : null,
        modelMetadata: listingData.metadata,
        assetId: `asset_${Date.now()}_${user.id}` // Generate unique asset ID
      });

      await this.listingRepository.save(listing);

      // Deduct listing point
      user.listingPoints -= 1;
      await this.userRepository.save(user);

      // Optionally create blockchain listing (for advanced features)
      try {
        const lucidService = await this.getLucidService();
        // This would create the actual blockchain listing
        // For now, we'll just log it
        this.logger.info(`Would create blockchain listing for asset: ${listing.assetId}`);
      } catch (error) {
        this.logger.warn('Blockchain listing creation failed, but database listing was created:', error);
      }

      return {
        success: true,
        listingId: listing.id,
        assetId: listing.assetId,
        ipfsHash: ipfsHash
      };

    } catch (error) {
      this.logger.error('Error creating listing for user:', error);
      return { success: false, error: 'Failed to create listing' };
    }
  }

  // Platform-managed purchase for fiat users
  async processPurchaseForUser(userEmail: string, assetId: string, paymentDetails: {
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
  }): Promise<{
    success: boolean;
    purchaseId?: string;
    accessToken?: string;
    error?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userEmail }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const listing = await this.listingRepository.findOne({
        where: { assetId: assetId, isActive: true }
      });

      if (!listing) {
        return { success: false, error: 'Listing not found' };
      }

      // Create purchase record
      const purchase = this.purchaseRepository.create({
        buyer: user,
        listing: listing,
        amount: BigInt(Math.floor(paymentDetails.amount * 1000000)),
        currency: paymentDetails.currency,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
        status: 'completed',
        purchaseDate: new Date()
      });

      await this.purchaseRepository.save(purchase);

      // Mint access token for user (platform-managed)
      const accessToken = await this.nftService.mintAccessTokenForUser(userEmail, assetId);

      // Update seller's balance (platform-managed)
      listing.seller.listingPoints = (listing.seller.listingPoints || 0) + 1;
      await this.userRepository.save(listing.seller);

      return {
        success: true,
        purchaseId: purchase.id,
        accessToken: accessToken
      };

    } catch (error) {
      this.logger.error('Error processing purchase for user:', error);
      return { success: false, error: 'Failed to process purchase' };
    }
  }

  // Get user's blockchain assets (platform-managed)
  async getUserAssets(userEmail: string): Promise<{
    success: boolean;
    assets?: Array<{
      assetId: string;
      title: string;
      type: string;
      purchaseDate: Date;
      accessToken?: string;
    }>;
    error?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userEmail }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get all completed purchases
      const purchases = await this.purchaseRepository.find({
        where: {
          buyer: { id: user.id },
          status: 'completed'
        },
        relations: ['listing']
      });

      const assets = purchases.map(purchase => ({
        assetId: purchase.listing.assetId,
        title: purchase.listing.title,
        type: purchase.listing.type,
        purchaseDate: purchase.purchaseDate,
        accessToken: `token_${purchase.listing.assetId}_${user.id}`
      }));

      return {
        success: true,
        assets
      };

    } catch (error) {
      this.logger.error('Error getting user assets:', error);
      return { success: false, error: 'Failed to get user assets' };
    }
  }

  // Platform-managed metadata retrieval
  async getAssetMetadata(assetId: string): Promise<{
    success: boolean;
    metadata?: any;
    error?: string;
  }> {
    try {
      const metadata = await this.nftService.getMetadataFromAssetId(assetId);
      
      if (!metadata) {
        return { success: false, error: 'Metadata not found' };
      }

      return {
        success: true,
        metadata
      };

    } catch (error) {
      this.logger.error('Error getting asset metadata:', error);
      return { success: false, error: 'Failed to get metadata' };
    }
  }

  // Batch operations for marketplace
  async getMarketplaceData(assetIds: string[]): Promise<{
    success: boolean;
    data?: Map<string, {
      metadata: any;
      listing: any;
      accessCount: number;
    }>;
    error?: string;
  }> {
    try {
      const metadataMap = await this.nftService.getMarketplaceMetadata(assetIds);
      
      // Get listing data
      const listings = await this.listingRepository.find({
        where: assetIds.map(id => ({ assetId: id }))
      });

      // Get access counts
      const accessCounts = await Promise.all(
        assetIds.map(async (assetId) => {
          const count = await this.purchaseRepository.count({
            where: {
              listing: { assetId: assetId },
              status: 'completed'
            }
          });
          return { assetId, count };
        })
      );

      const data = new Map();
      assetIds.forEach(assetId => {
        const listing = listings.find(l => l.assetId === assetId);
        const metadata = metadataMap.get(assetId);
        const accessCount = accessCounts.find(ac => ac.assetId === assetId)?.count || 0;

        if (listing) {
          data.set(assetId, {
            metadata,
            listing,
            accessCount
          });
        }
      });

      return {
        success: true,
        data
      };

    } catch (error) {
      this.logger.error('Error getting marketplace data:', error);
      return { success: false, error: 'Failed to get marketplace data' };
    }
  }

  // Platform statistics
  async getPlatformStats(): Promise<{
    success: boolean;
    stats?: {
      totalListings: number;
      totalPurchases: number;
      totalUsers: number;
      totalRevenue: number;
      activeAssets: number;
    };
    error?: string;
  }> {
    try {
      const [
        totalListings,
        totalPurchases,
        totalUsers,
        activeAssets
      ] = await Promise.all([
        this.listingRepository.count({ where: { isActive: true } }),
        this.purchaseRepository.count({ where: { status: 'completed' } }),
        this.userRepository.count(),
        this.listingRepository.count({ where: { isActive: true } })
      ]);

      // Calculate total revenue (simplified)
      const completedPurchases = await this.purchaseRepository.find({
        where: { status: 'completed' }
      });

      const totalRevenue = completedPurchases.reduce((sum, purchase) => {
        return sum + Number(purchase.amount) / 1000000; // Convert from Lovelace
      }, 0);

      return {
        success: true,
        stats: {
          totalListings,
          totalPurchases,
          totalUsers,
          totalRevenue,
          activeAssets
        }
      };

    } catch (error) {
      this.logger.error('Error getting platform stats:', error);
      return { success: false, error: 'Failed to get platform stats' };
    }
  }
}
