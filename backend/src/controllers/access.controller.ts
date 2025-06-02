import type { Request, Response } from 'express';
import { NFTService } from '../services/nft.service.js';
import type { UserPayload } from '../types/auth.js';
import { dbSyncService } from '../config/database.js';
import type { UTXO as BlockchainUTXO } from '../types/blockchain.js';

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
      const hasAccess = await this.nftService.verifyAccess(ownerAddress, assetId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get UTXOs for the address
      const utxos = await dbSyncService.getUtxosForAddress(ownerAddress);
      const dbUtxo = utxos.find(u => {
        const assets = u.assets || {};
        return Object.keys(assets).includes(assetId);
      });

      if (!dbUtxo) {
        res.status(404).json({ error: 'NFT not found' });
        return;
      }

      // Map database UTXO to blockchain UTXO
      const blockchainUtxo: BlockchainUTXO = {
        txHash: dbUtxo.tx_hash,
        outputIndex: dbUtxo.tx_index,
        amount: 0, // This will be set by the blockchain service
        address: ownerAddress,
        assets: dbUtxo.assets
      };

      // Get metadata
      const metadata = await this.nftService.getMetadataFromNFT(blockchainUtxo);
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
      const ownerAddress = req.user.wallet;

      if (!ownerAddress) {
        res.status(400).json({ error: 'User wallet address not found' });
        return;
      }

      const hasAccess = await this.nftService.verifyAccess(ownerAddress, assetId);
      res.json({ hasAccess });
    } catch (error) {
      console.error('Error verifying access:', error);
      res.status(500).json({ error: 'Failed to verify access' });
    }
  }
} 