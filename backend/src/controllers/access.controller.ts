import { Request, Response } from 'express';
import { NFTService } from '../services/nft.service';
import { UserPayload } from '../types/auth';

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
      const ownerAddress = req.user.wallet;

      if (!ownerAddress) {
        res.status(400).json({ error: 'User wallet address not found' });
        return;
      }

      // Verify ownership
      const hasAccess = await this.nftService.verifyAccess(assetId, ownerAddress);
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get metadata
      const metadata = await this.nftService.getMetadataFromNFT(assetId, ownerAddress);
      res.json({ metadata });
    } catch (error) {
      console.error('Error accessing metadata:', error);
      res.status(500).json({ error: 'Failed to access metadata' });
    }
  }

  verifyAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const ownerAddress = req.user.wallet;

      if (!ownerAddress) {
        res.status(400).json({ error: 'User wallet address not found' });
        return;
      }

      const hasAccess = await this.nftService.verifyAccess(assetId, ownerAddress);
      res.json({ hasAccess });
    } catch (error) {
      console.error('Error verifying access:', error);
      res.status(500).json({ error: 'Failed to verify access' });
    }
  }
} 