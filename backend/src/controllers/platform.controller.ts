import type { Request, Response } from 'express';
import { PlatformBlockchainService } from '../services/platform-blockchain.service.js';
import { NFTService } from '../services/nft.service.js';
import type { UserPayload } from '../types/auth.js';
import { Logger } from '../utils/logger.js';

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export class PlatformController {
  private platformService: PlatformBlockchainService;
  private nftService: NFTService;
  private logger: Logger;

  constructor() {
    this.platformService = new PlatformBlockchainService();
    this.nftService = new NFTService();
    this.logger = new Logger('PlatformController');
  }

  // Create listing (platform-managed)
  createListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user.email;
      const { title, description, price, type, metadata, files } = req.body;

      if (!userEmail) {
        res.status(400).json({ success: false, error: 'User email not found' });
        return;
      }

      const result = await this.platformService.createListingForUser(userEmail, {
        title,
        description,
        price,
        type,
        metadata,
        files
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            listingId: result.listingId,
            assetId: result.assetId,
            ipfsHash: result.ipfsHash
          },
          message: 'Listing created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Error creating listing:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create listing'
      });
    }
  };

  // Process purchase (platform-managed)
  processPurchase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user.email;
      const { assetId, amount, currency, paymentMethod, transactionId } = req.body;

      if (!userEmail) {
        res.status(400).json({ success: false, error: 'User email not found' });
        return;
      }

      const result = await this.platformService.processPurchaseForUser(userEmail, assetId, {
        amount,
        currency,
        paymentMethod,
        transactionId
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            purchaseId: result.purchaseId,
            accessToken: result.accessToken
          },
          message: 'Purchase processed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Error processing purchase:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process purchase'
      });
    }
  };

  // Get user assets (platform-managed)
  getUserAssets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user.email;

      if (!userEmail) {
        res.status(400).json({ success: false, error: 'User email not found' });
        return;
      }

      const result = await this.platformService.getUserAssets(userEmail);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            assets: result.assets
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Error getting user assets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user assets'
      });
    }
  };

  // Get asset metadata (platform-managed)
  getAssetMetadata = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const userEmail = req.user.email;

      if (!userEmail) {
        res.status(400).json({ success: false, error: 'User email not found' });
        return;
      }

      // Verify access first
      const hasAccess = await this.nftService.verifyUserAccess(userEmail, assetId);
      if (!hasAccess) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      const result = await this.platformService.getAssetMetadata(assetId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            metadata: result.metadata
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Error getting asset metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get asset metadata'
      });
    }
  };

  // Get marketplace data (batch)
  getMarketplaceData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { assetIds } = req.body;

      if (!Array.isArray(assetIds)) {
        res.status(400).json({ success: false, error: 'Asset IDs must be an array' });
        return;
      }

      const result = await this.platformService.getMarketplaceData(assetIds);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            marketplaceData: Object.fromEntries(result.data || new Map())
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Error getting marketplace data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get marketplace data'
      });
    }
  };

  // Get platform statistics
  getPlatformStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await this.platformService.getPlatformStats();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            stats: result.stats
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Error getting platform stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get platform stats'
      });
    }
  };

  // Get user access summary
  getUserAccessSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user.email;

      if (!userEmail) {
        res.status(400).json({ success: false, error: 'User email not found' });
        return;
      }

      const summary = await this.nftService.getUserAccessSummary(userEmail);

      res.status(200).json({
        success: true,
        data: {
          accessibleAssets: summary.accessibleAssets,
          totalAccess: summary.totalAccess
        }
      });
    } catch (error) {
      this.logger.error('Error getting user access summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user access summary'
      });
    }
  };

  // Mint access token for user
  mintAccessToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user.email;
      const { assetId } = req.body;

      if (!userEmail) {
        res.status(400).json({ success: false, error: 'User email not found' });
        return;
      }

      const accessToken = await this.nftService.mintAccessTokenForUser(userEmail, assetId);

      if (accessToken) {
        res.status(200).json({
          success: true,
          data: {
            accessToken
          },
          message: 'Access token minted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to mint access token'
        });
      }
    } catch (error) {
      this.logger.error('Error minting access token:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mint access token'
      });
    }
  };
}
