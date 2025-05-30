import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Listing } from '../entities/Listing';
import { User } from '../entities/User';
import { Agent } from '../entities/Agent';
import { AppError } from '../middleware/error.middleware';

const listingRepository = AppDataSource.getRepository(Listing);
const userRepository = AppDataSource.getRepository(User);
const agentRepository = AppDataSource.getRepository(Agent);

export class ListingController {
  async createListing(req: Request, res: Response) {
    const { agentId, price, duration, modelMetadata, metadataUri } = req.body;
    const sellerId = (req as any).user.id;

    const seller = await userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new AppError('Seller not found', 404, 'SELLER_NOT_FOUND');
    }

    const agent = await agentRepository.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    const listing = listingRepository.create({
      seller,
      agent,
      price: BigInt(price),
      duration,
      modelMetadata,
      metadataUri,
      status: 'pending'
    });

    await listingRepository.save(listing);
    res.status(201).json(listing);
  }

  async getListing(req: Request, res: Response) {
    const { id } = req.params;
    const listing = await listingRepository.findOne({
      where: { id },
      relations: ['seller', 'agent']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    res.json(listing);
  }

  async updateListing(req: Request, res: Response) {
    const { id } = req.params;
    const sellerId = (req as any).user.id;
    const { price, duration, status } = req.body;

    const listing = await listingRepository.findOne({
      where: { id, seller: { id: sellerId } },
      relations: ['seller']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    if (price) listing.price = BigInt(price);
    if (duration) listing.duration = duration;
    if (status) listing.status = status;

    await listingRepository.save(listing);
    res.json(listing);
  }

  async deleteListing(req: Request, res: Response) {
    const { id } = req.params;
    const sellerId = (req as any).user.id;

    const listing = await listingRepository.findOne({
      where: { id, seller: { id: sellerId } },
      relations: ['seller']
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    await listingRepository.remove(listing);
    res.status(204).send();
  }

  async listListings(req: Request, res: Response) {
    const listings = await listingRepository.find({
      relations: ['seller', 'agent'],
      order: { createdAt: 'DESC' }
    });
    res.json(listings);
  }
} 