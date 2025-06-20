import { PinataSDK } from 'pinata';
import type { PinataResponse } from 'pinata';
import { config } from 'dotenv';
import { Logger } from '../utils/logger.js';
import type { AIModelMetadata } from '../types/model.js';
import type { AIModelNFTMetadata } from '../types/nft.js';

config();

export interface PinataFileResponse extends Omit<PinataResponse, 'data'> {
  data: Buffer | string;
  contentType: string;
}

export interface PinataMetadataResponse extends Omit<PinataResponse, 'data'> {
  data: AIModelNFTMetadata;
  contentType: string;
}

export class PinataService {
  private pinata: PinataSDK;
  private logger: Logger;
  private gateway: string;

  constructor() {
    this.logger = new Logger('PinataService');
    this.gateway = process.env.PINATA_GATEWAY || '';

    if (!process.env.PINATA_JWT) {
      this.logger.error('PINATA_JWT environment variable is not set');
      throw new Error('PINATA_JWT environment variable is required for IPFS uploads');
    }

    try {
      this.pinata = new PinataSDK({
        pinataJwt: process.env.PINATA_JWT!,
        pinataGateway: this.gateway,
      });
      this.logger.info('PinataService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PinataSDK:', error);
      throw new Error(`Failed to initialize PinataSDK: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(file: Buffer, fileName: string, mimeType = 'application/octet-stream'): Promise<PinataResponse> {
    try {
      const fileObj = new File([file], fileName, { type: mimeType });
      const result = await this.pinata.upload.public.file(fileObj);
      this.logger.info(`File uploaded successfully: ${result.cid}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const result = await this.uploadFile(imageBuffer, fileName, 'image/png');
      return `ipfs://${result.cid}`;
    } catch (error) {
      this.logger.error('Failed to upload image:', error);
      throw error;
    }
  }

  async uploadNFTMetadata(
    modelMetadata: AIModelMetadata,
    imageCid: string,
    options: {
      name: string;
      description: string;
    }
  ): Promise<PinataResponse> {
    try {
      // Validate required metadata fields
      if (!modelMetadata.name || !modelMetadata.description || !modelMetadata.version) {
        throw new Error('Missing required model metadata fields: name, description, and version are required');
      }

      // Create NFT metadata
      const nftMetadata: AIModelNFTMetadata = {
        name: options.name,
        description: options.description,
        image: imageCid,
        properties: {
          modelMetadata: modelMetadata,
          category: 'AI Model',
          version: modelMetadata.version
        }
      };

      const result = await this.pinata.upload.public.json(nftMetadata);
      this.logger.info(`NFT metadata uploaded successfully: ${result.cid}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to upload NFT metadata:', error);
      throw error;
    }
  }

  async retrieveFile(cid: string): Promise<PinataFileResponse> {
    try {
      const data = await this.pinata.gateways.public.get(cid);
      this.logger.info(`File retrieved successfully for CID: ${cid}`);
      const { ipfsHash, pinSize, timestamp, ...rest } = data;
      return {
        ...rest,
        ipfsHash,
        pinSize,
        timestamp,
        data: data.data || '',
        contentType: data.type || 'application/octet-stream'
      };
    } catch (error) {
      this.logger.error('Failed to retrieve file:', error);
      throw error;
    }
  }

  async retrieveNFTMetadata(cid: string): Promise<PinataMetadataResponse> {
    try {
      const data = await this.pinata.gateways.public.get(cid);
      this.logger.info(`NFT metadata retrieved successfully for CID: ${cid}`);
      
      // Validate that the retrieved data matches AIModelNFTMetadata structure
      const metadata = data.data as AIModelNFTMetadata;
      if (!metadata.name || !metadata.description || !metadata.image || !metadata.properties?.modelMetadata) {
        throw new Error('Retrieved data does not match AIModelNFTMetadata structure');
      }

      const { ipfsHash, pinSize, timestamp, ...rest } = data;
      return {
        ...rest,
        ipfsHash,
        pinSize,
        timestamp,
        data: metadata,
        contentType: 'application/json'
      };
    } catch (error) {
      this.logger.error('Failed to retrieve NFT metadata:', error);
      throw error;
    }
  }
} 