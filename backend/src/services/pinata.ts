import { PinataSDK, FileObject } from 'pinata-web3';
import { config } from 'dotenv';
import { Logger } from '../utils/logger';
import { ValidationError } from '../types/errors';

config();

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  properties: {
    files: Array<{
      name: string;
      mediaType: string;
      src: string;
    }>;
    category: string;
    version: string;
  };
  version: string;
}

export class PinataService {
  private pinata: PinataSDK;
  private logger: Logger;
  private gateway: string;

  constructor() {
    this.logger = new Logger('PinataService');
    this.gateway = process.env.PINATA_GATEWAY || '';
    
    if (!process.env.PINATA_JWT) {
      throw new Error('PINATA_JWT environment variable is required');
    }

    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: this.gateway
    });
  }

  private validateMetadata(metadata: NFTMetadata): void {
    if (!metadata.name || typeof metadata.name !== 'string') {
      throw new ValidationError('Invalid metadata: name is required and must be a string');
    }

    if (!metadata.description || typeof metadata.description !== 'string') {
      throw new ValidationError('Invalid metadata: description is required and must be a string');
    }

    if (!metadata.image || typeof metadata.image !== 'string') {
      throw new ValidationError('Invalid metadata: image is required and must be a string');
    }

    if (!metadata.properties || typeof metadata.properties !== 'object') {
      throw new ValidationError('Invalid metadata: properties is required and must be an object');
    }

    if (!Array.isArray(metadata.properties.files)) {
      throw new ValidationError('Invalid metadata: properties.files must be an array');
    }

    metadata.properties.files.forEach((file, index) => {
      if (!file.name || !file.mediaType || !file.src) {
        throw new ValidationError(`Invalid file at index ${index}: name, mediaType, and src are required`);
      }
    });

    if (!metadata.properties.category || typeof metadata.properties.category !== 'string') {
      throw new ValidationError('Invalid metadata: properties.category is required and must be a string');
    }

    if (!metadata.properties.version || typeof metadata.properties.version !== 'string') {
      throw new ValidationError('Invalid metadata: properties.version is required and must be a string');
    }
  }

  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      this.validateMetadata(metadata);

      const result = await this.pinata.upload.json(metadata);
      this.logger.info(`Metadata uploaded successfully: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to upload metadata:', error);
      throw error;
    }
  }

  async uploadFile(file: FileObject): Promise<string> {
    try {
      const result = await this.pinata.upload.file(file);
      this.logger.info(`File uploaded successfully: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  async getMetadata(ipfsHash: string): Promise<NFTMetadata> {
    try {
      const response = await fetch(`${this.gateway}/ipfs/${ipfsHash}`);
      const data = await response.json();
      const metadata = data as NFTMetadata;
      this.validateMetadata(metadata);
      return metadata;
    } catch (error) {
      this.logger.error('Failed to retrieve metadata:', error);
      throw error;
    }
  }

  async getFile(ipfsHash: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.gateway}/ipfs/${ipfsHash}`);
      return await response.blob();
    } catch (error) {
      this.logger.error('Failed to retrieve file:', error);
      throw error;
    }
  }

  async pinFile(ipfsHash: string): Promise<void> {
    try {
      // Since we're already uploading through Pinata, the file is automatically pinned
      this.logger.info(`File is already pinned: ${ipfsHash}`);
    } catch (error) {
      this.logger.error('Failed to pin file:', error);
      throw error;
    }
  }

  async unpinFile(ipfsHash: string): Promise<void> {
    try {
      // Note: Unpinning is not supported in the current version of the SDK
      this.logger.warn(`Unpinning is not supported: ${ipfsHash}`);
    } catch (error) {
      this.logger.error('Failed to unpin file:', error);
      throw error;
    }
  }
} 