import { Lucid } from "@lucid-evolution/lucid";
import { Logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { Purchase } from '../entities/Purchase';
import { Listing } from '../entities/Listing';

export class TransactionMonitorService {
  private lucid: Lucid;
  private logger: Logger;
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private listingRepository = AppDataSource.getRepository(Listing);
  private checkInterval: number = 30000; // 30 seconds
  private maxConfirmations: number = 20; // ~10 minutes on Cardano
  private isMonitoring: boolean = false;

  constructor(lucid: Lucid) {
    this.lucid = lucid;
    this.logger = new Logger('TransactionMonitorService');
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('Transaction monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.logger.info('Starting transaction monitoring');

    while (this.isMonitoring) {
      try {
        await this.checkPendingTransactions();
        await new Promise(resolve => setTimeout(resolve, this.checkInterval));
      } catch (error) {
        this.logger.error('Error in transaction monitoring:', error);
      }
    }
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.logger.info('Stopping transaction monitoring');
  }

  private async checkPendingTransactions() {
    // Check pending purchases
    const pendingPurchases = await this.purchaseRepository.find({
      where: { status: 'pending' }
    });

    for (const purchase of pendingPurchases) {
      try {
        const txStatus = await this.checkTransactionStatus(purchase.txHash);
        
        if (txStatus.confirmed) {
          await this.handleConfirmedPurchase(purchase, txStatus.confirmations);
        } else if (txStatus.failed) {
          await this.handleFailedPurchase(purchase);
        }
      } catch (error) {
        this.logger.error(`Error checking purchase ${purchase.id}:`, error);
      }
    }

    // Check pending listings
    const pendingListings = await this.listingRepository.find({
      where: { status: 'pending' }
    });

    for (const listing of pendingListings) {
      try {
        const txStatus = await this.checkTransactionStatus(listing.txHash);
        
        if (txStatus.confirmed) {
          await this.handleConfirmedListing(listing, txStatus.confirmations);
        } else if (txStatus.failed) {
          await this.handleFailedListing(listing);
        }
      } catch (error) {
        this.logger.error(`Error checking listing ${listing.id}:`, error);
      }
    }
  }

  private async checkTransactionStatus(txHash: string) {
    try {
      const tx = await this.lucid.utxosAt(txHash);
      
      if (!tx || tx.length === 0) {
        return { confirmed: false, failed: false, confirmations: 0 };
      }

      const currentBlock = await this.lucid.utxosAt(txHash);
      const confirmations = currentBlock.length;

      return {
        confirmed: confirmations >= this.maxConfirmations,
        failed: false,
        confirmations
      };
    } catch (error) {
      this.logger.error(`Error checking transaction ${txHash}:`, error);
      return { confirmed: false, failed: true, confirmations: 0 };
    }
  }

  private async handleConfirmedPurchase(purchase: Purchase, confirmations: number) {
    this.logger.info(`Purchase ${purchase.id} confirmed with ${confirmations} confirmations`);
    
    await this.purchaseRepository.update(purchase.id, {
      status: 'completed',
      confirmations
    });

    // Emit event for webhook notification
    this.emitTransactionEvent('purchase.confirmed', {
      purchaseId: purchase.id,
      txHash: purchase.txHash,
      confirmations
    });
  }

  private async handleFailedPurchase(purchase: Purchase) {
    this.logger.warn(`Purchase ${purchase.id} failed`);
    
    await this.purchaseRepository.update(purchase.id, {
      status: 'failed'
    });

    // Emit event for webhook notification
    this.emitTransactionEvent('purchase.failed', {
      purchaseId: purchase.id,
      txHash: purchase.txHash
    });
  }

  private async handleConfirmedListing(listing: Listing, confirmations: number) {
    this.logger.info(`Listing ${listing.id} confirmed with ${confirmations} confirmations`);
    
    await this.listingRepository.update(listing.id, {
      status: 'active',
      confirmations
    });

    // Emit event for webhook notification
    this.emitTransactionEvent('listing.confirmed', {
      listingId: listing.id,
      txHash: listing.txHash,
      confirmations
    });
  }

  private async handleFailedListing(listing: Listing) {
    this.logger.warn(`Listing ${listing.id} failed`);
    
    await this.listingRepository.update(listing.id, {
      status: 'cancelled'
    });

    // Emit event for webhook notification
    this.emitTransactionEvent('listing.failed', {
      listingId: listing.id,
      txHash: listing.txHash
    });
  }

  private emitTransactionEvent(event: string, data: any) {
    // TODO: Implement event emission system (e.g., using EventEmitter or a message queue)
    this.logger.info(`Event emitted: ${event} - ${JSON.stringify(data)}`);
  }
} 