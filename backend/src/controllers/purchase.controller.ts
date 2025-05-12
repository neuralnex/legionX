import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Purchase } from '../entities/Purchase';
import { Listing } from '../entities/Listing';
import { LucidService } from '../services/lucid';
import { UserPayload } from '../types/auth';
import { config } from 'dotenv';

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export class PurchaseController {
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private listingRepository = AppDataSource.getRepository(Listing);
  private lucidService: LucidService;

  constructor() {
    config(); // Load environment variables
    this.lucidService = new LucidService(
      process.env.BLOCKFROST_API_KEY || '',
      process.env.MARKET_VALIDATOR_ADDRESS || '',
      process.env.ORACLE_VALIDATOR_ADDRESS || ''
    );
  }

  createPurchase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { listingId, isFullPurchase } = req.body;
      const buyerAddress = req.user.wallet;

      if (!buyerAddress) {
        res.status(400).json({ error: 'User wallet address not found' });
        return;
      }

      const listing = await this.listingRepository.findOne({
        where: { id: parseInt(listingId) },
        relations: ['seller']
      });

      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (listing.status !== 'active') {
        res.status(400).json({ error: 'Listing is not active' });
        return;
      }

      // Build transaction
      const listingUTxO = await this.lucidService.getListingUTxO(listing.txHash);
      if (!listingUTxO) {
        res.status(404).json({ error: 'Listing UTxO not found' });
        return;
      }
      const buyerUtxos = await this.lucidService.getLucid().utxosAt(buyerAddress);
      const action = await this.lucidService.buildPurchaseTransaction(
        listingUTxO,
        buyerUtxos,
        listing.seller.wallet
      );

      // Create purchase record
      const purchase = this.purchaseRepository.create({
        buyer: { id: req.user.sub },
        listing: { id: parseInt(listingId) },
        amount: BigInt(isFullPurchase ? listing.fullPrice || listing.price : listing.price),
        status: 'pending',
        txHash: action
      });

      await this.purchaseRepository.save(purchase);

      res.status(201).json({ purchase, action });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create purchase' });
    }
  };

  getPurchases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const purchases = await this.purchaseRepository.find({
        where: { buyer: { id: req.user.sub } },
        relations: ['listing', 'listing.agent']
      });

      res.json({ purchases });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch purchases' });
    }
  };

  getPurchase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const purchase = await this.purchaseRepository.findOne({
        where: { id: parseInt(id), buyer: { id: req.user.sub } },
        relations: ['listing', 'listing.agent']
      });

      if (!purchase) {
        res.status(404).json({ error: 'Purchase not found' });
        return;
      }

      res.json({ purchase });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch purchase' });
    }
  };
} 