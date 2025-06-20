import { Lucid, Blockfrost } from '@lucid-evolution/lucid';
import type { UTxO, Script } from '@lucid-evolution/lucid';
import { Logger } from '../utils/logger.js';
import type { AIModelMetadata } from '../types/ai.js';
import { Listing } from '../entities/Listing.js';
import { Purchase } from '../entities/Purchase.js';
import { User } from '../entities/User.js';
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PinataService } from './pinata.js';
import type { AIModelNFTMetadata } from '../types/nft.js';

// Load environment variables
dotenv.config();

// Get current file's directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load contract information
const plutusJson = JSON.parse(readFileSync(join(__dirname, "../../../smartcontract/plutus.json"), "utf8"));
const privateKey = readFileSync(join(__dirname, "../../../smartcontract/me.sk"), "utf8").trim();
const walletAddress = readFileSync(join(__dirname, "../../../smartcontract/me.addr"), "utf8").trim();

// Types
interface MarketDatum {
  price: bigint;
  full_price: bigint | null;
  seller: string; // ByteArray as string (VerificationKey hash)
  subscription: string | null; // ByteArray as string (NFT policy ID if subscription)
  duration: number | null; // Subscription duration in months
  owner: string; // ByteArray as string (Current owner's VerificationKey hash)
}

interface OracleDatum {
  exchange: bigint;
  timestamp: number;
  currency: string;
}

interface ListingUTxO extends Omit<UTxO, 'datum'> {
  datum: MarketDatum;
}

// Extend AIModelMetadata to include required properties
interface ExtendedAIModelMetadata extends Omit<AIModelMetadata, 'version'> {
  image?: string;
  modelUrl?: string;
  version: string; // Make version required
}

export class LucidService {
  private lucid!: Lucid;
  private blockfrost!: Blockfrost;
  private validatorAddress: string;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private logger: Logger;
  private walletApi: any | null = null;
  private static instance: LucidService | null = null;
  private initialized: boolean = false;
  private pinataService: PinataService;
  private privateKey: string;

  private constructor() {
    this.logger = new Logger('LucidService');
    // Get the validator from plutus.json
    const validator = plutusJson.validators[0]; // Using first validator as in common.ts
    this.validatorAddress = validator.address;
    this.pinataService = new PinataService();
    this.privateKey = privateKey;
  }

  public static async getInstance(): Promise<LucidService> {
    if (!LucidService.instance) {
      LucidService.instance = new LucidService();
      await LucidService.instance.initializeLucid();
    }
    return LucidService.instance;
  }

  private async initializeLucid() {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize provider
      const blockfrostApiKey = process.env.BLOCKFROST_PROJECT_ID;
      if (!blockfrostApiKey) {
        throw new Error("BLOCKFROST_PROJECT_ID environment variable is not set");
      }

      // Initialize Blockfrost provider with proper error handling
      try {
        this.blockfrost = new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0",
          blockfrostApiKey
        );
      } catch (error) {
        this.logger.error('Failed to initialize Blockfrost provider:', error);
        throw new Error('Failed to initialize Blockfrost provider');
      }

      // Initialize Lucid with provider and network
      try {
        this.lucid = await Lucid(this.blockfrost, "Preprod");
      } catch (error) {
        this.logger.error('Failed to initialize Lucid:', error);
        throw new Error('Failed to initialize Lucid');
      }

      // Set initial wallet with error handling
      try {
        // Get UTxOs for the address
        const utxos = await this.lucid.utxosAt(walletAddress);
        this.logger.info(`Found ${utxos.length} UTxOs for address: ${walletAddress}`);
        
        // Set up address-only wallet
        this.lucid.selectWallet.fromAddress(walletAddress, utxos);
        this.logger.info(`Wallet set successfully. Address: ${walletAddress}`);
      } catch (error) {
        this.logger.error('Failed to set initial wallet:', error);
        throw new Error(`Failed to set initial wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      this.initialized = true;
      this.logger.info('Lucid initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing Lucid:', error);
      throw new Error(`Failed to initialize Lucid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Wallet Management Methods
  setWalletApi(walletApi: any): void {
    this.walletApi = walletApi;
    if (this.walletApi) {
      this.lucid.selectWallet.fromAPI(this.walletApi);
      this.logger.info('Wallet API set for transaction signing');
    } else {
      this.logger.warn('No wallet API provided');
    }
  }

  async connectWallet(walletAddress: string): Promise<void> {
    try {
      const utxos = await this.lucid.utxosAt(walletAddress);
      this.lucid.selectWallet.fromAddress(walletAddress, utxos);
      this.logger.info(`Wallet connected: ${walletAddress}`);
    } catch (error) {
      this.logger.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async connectUserWallet(walletAddress: string, utxos: UTxO[]): Promise<void> {
    try {
      this.lucid.selectWallet.fromAddress(walletAddress, utxos);
      this.logger.info(`User wallet connected: ${walletAddress}`);
    } catch (error) {
      this.logger.error('Error connecting user wallet:', error);
      throw new Error('Failed to connect user wallet');
    }
  }

  // Transaction Methods
  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`Operation failed (attempt ${i + 1}/${this.maxRetries}):`, error);
        if (i < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    throw lastError;
  }

  async signTransaction(tx: any): Promise<string> {
    try {
      const signedTx = await tx.sign.withWallet();
      return await signedTx.submit();
    } catch (error) {
      this.logger.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  // Market Methods
  async getExchangeRate(currency: string): Promise<bigint> {
    const oracleUtxos = await this.lucid.utxosAt(this.validatorAddress);
    const oracleUtxo = oracleUtxos.find((utxo: UTxO) => {
      try {
        const datum = JSON.parse(utxo.datum || '{}') as OracleDatum;
        return datum.currency === currency;
      } catch {
        return false;
      }
    });

    if (!oracleUtxo) {
      throw new Error(`No exchange rate found for currency: ${currency}`);
    }

    const datum = JSON.parse(oracleUtxo.datum || '{}') as OracleDatum;
    return datum.exchange;
  }

  async createListing(listing: Listing, seller: User): Promise<string> {
    try {
      // Check if PinataService is properly initialized
      if (!this.pinataService) {
        throw new Error('PinataService not initialized');
      }

      // Create NFT metadata for Pinata
      const modelMetadata = listing.modelMetadata as ExtendedAIModelMetadata;
      
      // Validate required metadata fields
      if (!modelMetadata.name || !modelMetadata.description || !modelMetadata.version) {
        throw new Error(`Missing required model metadata fields. Name: ${!!modelMetadata.name}, Description: ${!!modelMetadata.description}, Version: ${!!modelMetadata.version}`);
      }
      
      const nftMetadata: AIModelNFTMetadata = {
        name: modelMetadata.name,
        description: modelMetadata.description,
        image: modelMetadata.image || '', // Use a default image if none provided
        properties: {
          modelMetadata: {
            ...modelMetadata,
            accessPoint: {
              type: 'custom',
              endpoint: modelMetadata.modelUrl || ''
            },
            // Add file information to tags
            tags: [
              ...(modelMetadata.tags || []),
              `file:${modelMetadata.name}`,
              'mediaType:application/json'
            ]
          },
          category: 'AI Model',
          version: modelMetadata.version
        }
      };

      this.logger.info('Attempting to upload metadata to Pinata...');
      
      // Upload metadata to Pinata
      const result = await this.pinataService.uploadNFTMetadata(
        modelMetadata,
        nftMetadata.image,
        {
          name: nftMetadata.name,
          description: nftMetadata.description
        }
      );
      const ipfsHash = result.cid;
      this.logger.info(`Metadata uploaded to IPFS: ${ipfsHash}`);

      // Update listing with IPFS hash
      (listing as any).ipfsHash = ipfsHash;

      const metadata = {
        msg: ['List'],
        listingId: listing.id,
        price: listing.price.toString(),
        full_price: listing.fullPrice?.toString(),
        seller: seller.wallet || '',
        modelMetadata: JSON.stringify(listing.modelMetadata),
        subscription: listing.subscriptionId ? {
          duration: listing.duration,
          token: listing.subscriptionId
        } : undefined,
        ipfsHash: ipfsHash // Add IPFS hash to metadata
      };

      this.logger.info('Creating blockchain transaction...');

      const tx = await this.lucid
        .newTx()
        .pay.ToAddress(this.validatorAddress, { lovelace: listing.price })
        .attachMetadata(674, metadata)
      .complete();

      this.logger.info('Signing and submitting transaction...');
      return await this.signTransaction(tx);
    } catch (error) {
      this.logger.error('Error creating listing:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        listingId: listing.id,
        sellerId: seller.id
      });
      throw new Error(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateListing(listing: Listing, seller: User): Promise<string> {
    try {
      const metadata = {
        msg: ['Edit'],
        listingId: listing.id,
        price: listing.price.toString(),
        full_price: listing.fullPrice?.toString(),
        seller: seller.wallet || '',
        modelMetadata: JSON.stringify(listing.modelMetadata),
        subscription: listing.subscriptionId ? {
          duration: listing.duration,
          token: listing.subscriptionId
        } : undefined
      };

      const tx = await this.lucid
        .newTx()
        .pay.ToAddress(this.validatorAddress, { lovelace: listing.price })
        .attachMetadata(674, metadata)
      .complete();

      return await this.signTransaction(tx);
    } catch (error) {
      this.logger.error('Error updating listing:', error);
      throw new Error('Failed to update listing');
    }
  }

  async cancelListing(listing: Listing, seller: User): Promise<string> {
    try {
      const metadata = {
        msg: ['Cancel'],
        listingId: listing.id,
        price: listing.price.toString(),
        full_price: listing.fullPrice?.toString(),
        seller: seller.wallet || '',
        modelMetadata: JSON.stringify(listing.modelMetadata),
        subscription: listing.subscriptionId ? {
          duration: listing.duration,
          token: listing.subscriptionId
        } : undefined
      };

      const tx = await this.lucid
        .newTx()
        .pay.ToAddress(this.validatorAddress, { lovelace: 0n })
        .attachMetadata(674, metadata)
      .complete();

      return await this.signTransaction(tx);
    } catch (error) {
      this.logger.error('Error canceling listing:', error);
      throw new Error('Failed to cancel listing');
    }
  }

  // Purchase Methods
  async createPurchase(purchase: Purchase, buyer: User): Promise<string> {
    try {
      const metadata = {
        msg: ['Purchase'],
        purchaseId: purchase.id,
        price: purchase.amount.toString(),
        buyer: buyer.wallet || '',
        modelMetadata: JSON.stringify(purchase.listing.modelMetadata),
        subscription: purchase.listing.subscriptionId ? {
          duration: purchase.listing.duration,
          token: purchase.listing.subscriptionId
        } : undefined
      };

      const tx = await this.lucid
        .newTx()
        .pay.ToAddress(this.validatorAddress, { lovelace: purchase.amount })
        .attachMetadata(674, metadata)
      .complete();

      return await this.signTransaction(tx);
    } catch (error) {
      this.logger.error('Error creating purchase:', error);
      throw new Error('Failed to create purchase');
    }
  }

  // Utility Methods
  async estimateNetworkFee(tx: any): Promise<bigint> {
    try {
      return await tx.fee();
    } catch (error) {
      this.logger.error('Error estimating network fee:', error);
      throw new Error('Failed to estimate network fee');
    }
  }

  async verifyWalletOwnership(walletAddress: string): Promise<boolean> {
    try {
      const utxos = await this.lucid.utxosAt(walletAddress);
      if (!utxos || utxos.length === 0) {
        this.logger.warn(`No UTxOs found for wallet: ${walletAddress}`);
        return false;
      }
      
      const tx = await this.lucid
        .newTx()
        .collectFrom(utxos)
        .complete();
        
      return true;
    } catch (error) {
      this.logger.error('Error verifying wallet ownership:', error);
      return false;
    }
  }

  getLucid(): Lucid {
    return this.lucid;
  }
}