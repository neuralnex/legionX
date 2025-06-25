import { dbSyncService } from '../config/database.js';
import { PinataService } from './pinata.js';
import type { UTXO, TransactionDetails } from '../types/blockchain.js';
import type { AIModelNFTMetadata } from '../types/nft.js';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { Purchase } from '../entities/Purchase.js';

export class NFTService {
  private pinataService: PinataService;
  private userRepository = AppDataSource.getRepository(User);
  private purchaseRepository = AppDataSource.getRepository(Purchase);

  constructor() {
    this.pinataService = new PinataService();
  }

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
            console.error('Error getting NFT metadata:', error);
            return null;
        }
    }

    async getMetadataFromAssetId(assetId: string): Promise<AIModelNFTMetadata | null> {
        try {
            // For the hybrid system, we'll return null for now
            // In a production system, this would query a metadata database
            // or use the blockchain data to retrieve actual metadata
            console.log(`Getting metadata for asset ${assetId} - returning null for hybrid system`);
            return null;
        } catch (error) {
            console.error('Error getting metadata from asset ID:', error);
            return null;
        }
    }

    async verifyAccess(address: string, assetId: string): Promise<boolean> {
    try {
            const utxos = await dbSyncService.getUtxosForAddress(address);
            return utxos.some(utxo => {
                const assets = utxo.assets || {};
                return Object.keys(assets).includes(assetId);
            });
    } catch (error) {
            console.error('Error verifying NFT access:', error);
      return false;
    }
  }

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
      // This is a simplified check - in production you'd verify against blockchain
      const purchase = await this.purchaseRepository.findOne({
        where: {
          buyer: { id: user.id },
          listing: { assetId: assetId },
          status: 'completed'
        }
      });

      return !!purchase;
    } catch (error) {
      console.error('Error verifying user access:', error);
      return false;
    }
  }
} 