import { dbSyncService, UTXO, TransactionDetails } from '../config/database';
import { PinataService, NFTMetadata } from './pinata';

export class NFTService {
  private pinataService: PinataService;

  constructor() {
    this.pinataService = new PinataService();
  }

  async getMetadataFromNFT(assetId: string, ownerAddress: string): Promise<NFTMetadata> {
    try {
      // 1. Verify ownership using DBSync
      const utxos = await dbSyncService.getUtxosForAddress(ownerAddress);
      const hasAsset = utxos.some((utxo: UTXO) => 
        utxo.assets && utxo.assets[assetId] && utxo.assets[assetId] > 0
      );

      if (!hasAsset) {
        throw new Error('User does not own this NFT');
      }

      // 2. Get transaction details to find metadata
      const txDetails = await dbSyncService.getTransactionDetails(utxos[0].tx_hash);
      if (!txDetails) {
        throw new Error('Transaction not found');
      }

      // 3. Extract IPFS hash from transaction metadata
      const ipfsHash = this.extractIPFSHash(txDetails);
      if (!ipfsHash) {
        throw new Error('No metadata found in transaction');
      }

      // 4. Retrieve metadata from IPFS
      const metadata = await this.pinataService.getMetadata(ipfsHash);
      return metadata;
    } catch (error) {
      console.error('Error retrieving NFT metadata:', error);
      throw new Error('Failed to retrieve NFT metadata');
    }
  }

  private extractIPFSHash(txDetails: TransactionDetails): string | null {
    try {
      // Extract IPFS hash from transaction metadata
      const metadata = txDetails.metadata;
      if (!metadata) return null;

      // Example: Looking for IPFS hash in metadata
      const ipfsHash = metadata['674']?.msg || metadata['674']?.ipfs;
      return ipfsHash || null;
    } catch (error) {
      console.error('Error extracting IPFS hash:', error);
      return null;
    }
  }

  async verifyAccess(assetId: string, ownerAddress: string): Promise<boolean> {
    try {
      const utxos = await dbSyncService.getUtxosForAddress(ownerAddress);
      return utxos.some((utxo: UTXO) => 
        utxo.assets && utxo.assets[assetId] && utxo.assets[assetId] > 0
      );
    } catch (error) {
      console.error('Error verifying access:', error);
      return false;
    }
  }
} 