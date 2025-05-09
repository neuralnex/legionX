import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Purchase } from '../entities/Purchase';
import { Listing } from '../entities/Listing';
import { LucidService } from '../services/lucid';
import { UserPayload } from '../types/auth';

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export class PurchaseController {
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private listingRepository = AppDataSource.getRepository(Listing);
  private lucidService: LucidService;

  constructor() {
    this.lucidService = new LucidService();
  }

  createPurchase = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { listingId, isFullPurchase } = req.body;
      const buyerAddress = req.user.wallet;

      if (!buyerAddress) {
        return res.status(400).json({ error: 'User wallet address not found' });
      }

      const listing = await this.listingRepository.findOne({
        where: { id: parseInt(listingId) },
        relations: ['seller']
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.status !== 'active') {
        return res.status(400).json({ error: 'Listing is not active' });
      }

      // Build transaction
      const action = await this.lucidService.buildPurchaseTx(
        listingId,
        buyerAddress,
        isFullPurchase
      );

      // Create purchase record
      const purchase = this.purchaseRepository.create({
        listing,
        buyer: { id: req.user.sub },
        amount: isFullPurchase ? listing.fullPrice : listing.price,
        txHash: '', // Will be updated after transaction confirmation
        status: 'pending'
      });

      await this.purchaseRepository.save(purchase);

      res.status(201).json({ purchase, action });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create purchase' });
    }
  };

  getPurchases = async (req: AuthenticatedRequest, res: Response) => {
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

  getPurchase = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const purchase = await this.purchaseRepository.findOne({
        where: { id: parseInt(id), buyer: { id: req.user.sub } },
        relations: ['listing', 'listing.agent']
      });

      if (!purchase) {
        return res.status(404).json({ error: 'Purchase not found' });
      }

      res.json({ purchase });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch purchase' });
    }
  };
} 