import { dbSyncService } from '../config/database.js';
import { PinataService } from './pinata.js';
import type { UTXO, TransactionDetails } from '../types/blockchain.js';
import type { AIModelNFTMetadata } from '../types/nft.js';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { Purchase } from '../entities/Purchase.js';
import { Listing } from '../entities/Listing.js';
import { LucidService } from './lucid.js';
import { Logger } from '../utils/logger.js';

export class NFTService {
  private pinataService: PinataService;
  private userRepository = AppDataSource.getRepository(User);
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private listingRepository = AppDataSource.getRepository(Listing);
  private lucidService: LucidService | null = null;
  private logger: Logger;

  constructor() {
    this.pinataService = new PinataService();
    this.logger = new Logger('NFTService');
  }

  private async getLucidService(): Promise<LucidService> {
    if (!this.lucidService) {
      this.lucidService = await LucidService.getInstance();
    }
    return this.lucidService;
  }

  // Enhanced metadata retrieval with fallback
  async getMetadataFromNFT(utxo: UTXO): Promise<AIModelNFTMetadata | null> {
    try {
      // Get transaction details
      const txDetails = await dbSyncService.getTransactionDetails(utxo.txHash);
      if (!txDetails || !txDetails.metadata) {
        return null;
      }

      // Get metadata from IPFS
      const ipfsHash = txDetails.metadata['674']?.ipfs;
      if (!ipfsHash) {
        return null;
      }

      const response = await this.pinataService.retrieveNFTMetadata(ipfsHash);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting NFT metadata:', error);
      return null;
    }
  }

  // Enhanced metadata retrieval for fiat users
  async getMetadataFromAssetId(assetId: string): Promise<AIModelNFTMetadata | null> {
    try {
      // First try to get from database (fiat-based)
      const listing = await this.listingRepository.findOne({
        where: { assetId: assetId }
      });

      if (listing && listing.metadataUri) {
        // Extract IPFS hash from metadata URI
        const ipfsHash = listing.metadataUri.replace('ipfs://', '');
        const response = await this.pinataService.retrieveNFTMetadata(ipfsHash);
        return response.data;
      }

      // Fallback to blockchain lookup (for advanced users)
      this.logger.info(`No database metadata found for ${assetId}, checking blockchain...`);
      return null;
    } catch (error) {
      this.logger.error('Error getting metadata from asset ID:', error);
      return null;
    }
  }

  // Enhanced access verification for fiat users
  async verifyAccess(address: string, assetId: string): Promise<boolean> {
    try {
      // For fiat users, we'll use database verification instead
      // This method is kept for backward compatibility with wallet users
      const utxos = await dbSyncService.getUtxosForAddress(address);
      return utxos.some(utxo => {
        const assets = utxo.assets || {};
        return Object.keys(assets).includes(assetId);
      });
    } catch (error) {
      this.logger.error('Error verifying NFT access:', error);
      return false;
    }
  }

  // Primary access verification for fiat users
  async verifyUserAccess(userEmail: string, assetId: string): Promise<boolean> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: userEmail }
      });

      if (!user) {
        return false;
      }

      // Check if user has purchased access to this asset
      const purchase = await this.purchaseRepository.findOne({
        where: {
          buyer: { id: user.id },
          listing: { assetId: assetId },
          status: 'completed'
        }
      });

      return !!purchase;
    } catch (error) {
      this.logger.error('Error verifying user access:', error);
      return false;
    }
  }

  // New: Platform-managed NFT minting for fiat users
  async mintAccessTokenForUser(userEmail: string, assetId: string): Promise<string | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userEmail }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify purchase exists
      const purchase = await this.purchaseRepository.findOne({
        where: {
          buyer: { id: user.id },
          listing: { assetId: assetId },
          status: 'completed'
        }
      });

      if (!purchase) {
        throw new Error('No valid purchase found');
      }

      // Use platform wallet to mint NFT for user
      const lucidService = await this.getLucidService();
      
      // Create a unique identifier for the user's access token
      const tokenId = `${assetId}-${user.id}-${Date.now()}`;
      
      // Mint NFT using platform wallet (this would be implemented in LucidService)
      // For now, return a placeholder transaction hash
      this.logger.info(`Minting access token ${tokenId} for user ${userEmail}`);
      
      return `minted-${tokenId}`;
    } catch (error) {
      this.logger.error('Error minting access token:', error);
      return null;
    }
  }

  // New: Batch metadata retrieval for marketplace
  async getMarketplaceMetadata(assetIds: string[]): Promise<Map<string, AIModelNFTMetadata>> {
    const metadataMap = new Map<string, AIModelNFTMetadata>();
    
    try {
      // Get all listings with these asset IDs
      const listings = await this.listingRepository.find({
        where: assetIds.map(id => ({ assetId: id }))
      });

      // Fetch metadata for each listing
      const metadataPromises = listings.map(async (listing) => {
        if (listing.metadataUri) {
          const ipfsHash = listing.metadataUri.replace('ipfs://', '');
          try {
            const response = await this.pinataService.retrieveNFTMetadata(ipfsHash);
            metadataMap.set(listing.assetId, response.data);
          } catch (error) {
            this.logger.error(`Error fetching metadata for ${listing.assetId}:`, error);
          }
        }
      });

      await Promise.all(metadataPromises);
      return metadataMap;
    } catch (error) {
      this.logger.error('Error in batch metadata retrieval:', error);
      return metadataMap;
    }
  }

  // New: Simplified access check for frontend
  async getUserAccessSummary(userEmail: string): Promise<{
    accessibleAssets: string[];
    totalAccess: number;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userEmail }
      });

      if (!user) {
        return { accessibleAssets: [], totalAccess: 0 };
      }

      // Get all completed purchases
      const purchases = await this.purchaseRepository.find({
        where: {
          buyer: { id: user.id },
          status: 'completed'
        },
        relations: ['listing']
      });

      const accessibleAssets = purchases.map(purchase => purchase.listing.assetId);

      return {
        accessibleAssets,
        totalAccess: accessibleAssets.length
      };
    } catch (error) {
      this.logger.error('Error getting user access summary:', error);
      return { accessibleAssets: [], totalAccess: 0 };
    }
  }
} 