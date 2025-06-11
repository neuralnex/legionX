import { dbSyncService } from '../config/database.js';
import { PinataService } from './pinata.js';
import type { UTXO, TransactionDetails } from '../types/blockchain.js';
import type { AIModelNFTMetadata } from '../types/nft.js';

export class NFTService {
  private pinataService: PinataService;

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
} 