import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Listing } from '../entities/Listing';
import { UserPayload } from '../types/auth';

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export class ListingController {
  private listingRepository = AppDataSource.getRepository(Listing);

  createListing = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { agentId, price, fullPrice } = req.body;

      const listing = this.listingRepository.create({
        agent: { id: agentId },
        seller: { id: req.user.sub },
        price,
        fullPrice,
        status: 'active'
      });

      await this.listingRepository.save(listing);
      res.status(201).json({ listing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create listing' });
    }
  };

  getListings = async (req: Request, res: Response) => {
    try {
      const listings = await this.listingRepository.find({
        where: { status: 'active' },
        relations: ['agent', 'seller']
      });

      res.json({ listings });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  };

  getListing = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const listing = await this.listingRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['agent', 'seller']
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      res.json({ listing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch listing' });
    }
  };

  updateListing = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { price, fullPrice, status } = req.body;

      const listing = await this.listingRepository.findOne({
        where: { id: parseInt(id), seller: { id: req.user.sub } }
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (price) listing.price = price;
      if (fullPrice) listing.fullPrice = fullPrice;
      if (status) listing.status = status;

      await this.listingRepository.save(listing);
      res.json({ listing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update listing' });
    }
  };

  deleteListing = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const listing = await this.listingRepository.findOne({
        where: { id: parseInt(id), seller: { id: req.user.sub } }
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      await this.listingRepository.remove(listing);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  };
} 