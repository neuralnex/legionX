import type { Request, Response } from 'express';
import { NFTService } from '../services/nft.service.js';
import type { UserPayload } from '../types/auth.js';

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export class AccessController {
  private nftService: NFTService;

  constructor() {
    this.nftService = new NFTService();
  }

  getMetadata = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const userEmail = req.user.email;

      if (!userEmail) {
        res.status(400).json({ error: 'User email not found' });
        return;
      }

      // Verify access through database (fiat-based)
      // The smart contract address will handle blockchain verification
      const hasAccess = await this.nftService.verifyUserAccess(userEmail, assetId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get metadata from IPFS
      const metadata = await this.nftService.getMetadataFromAssetId(assetId);
      if (!metadata) {
        res.status(404).json({ error: 'Metadata not found' });
        return;
      }

      res.json({ metadata });
    } catch (error) {
      console.error('Error accessing metadata:', error);
      res.status(500).json({ error: 'Failed to access metadata' });
    }
  }

  verifyAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const userEmail = req.user.email;

      if (!userEmail) {
        res.status(400).json({ error: 'User email not found' });
        return;
      }

      const hasAccess = await this.nftService.verifyUserAccess(userEmail, assetId);
      res.json({ hasAccess });
    } catch (error) {
      console.error('Error verifying access:', error);
      res.status(500).json({ error: 'Failed to verify access' });
    }
  }
} 