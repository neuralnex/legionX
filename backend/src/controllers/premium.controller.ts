import type { Request, Response } from 'express';
import { FeeService } from '../services/fee.service.js';
import { Logger } from '../utils/logger.ts';
import type { UserPayload } from '../types/auth.js';

export class PremiumController {
    /**
     * Get premium listing features
     */
    static async getPremiumFeatures(req: Request, res: Response) {
        try {
            const features = FeeService.getPremiumFeatures();
            res.json({ features });
        } catch (error) {
            Logger.error('Error getting premium features:', error);
            res.status(500).json({ error: 'Failed to get premium features' });
        }
    }

    /**
     * Get analytics features
     */
    static async getAnalyticsFeatures(req: Request, res: Response) {
        try {
            const features = FeeService.getAnalyticsFeatures();
            res.json({ features });
        } catch (error) {
            Logger.error('Error getting analytics features:', error);
            res.status(500).json({ error: 'Failed to get analytics features' });
        }
    }

    /**
     * Purchase premium listing
     */
    static async purchasePremiumListing(req: Request, res: Response) {
        try {
            const { listingId } = req.params;
            const user = req.user;

            const success = await FeeService.processPremiumListing(listingId, user.sub);
            if (success) {
                res.json({ message: 'Premium listing purchased successfully' });
            } else {
                res.status(400).json({ error: 'Failed to purchase premium listing' });
            }
        } catch (error) {
            Logger.error('Error purchasing premium listing:', error);
            res.status(500).json({ error: 'Failed to purchase premium listing' });
        }
    }

    /**
     * Purchase analytics subscription
     */
    static async purchaseAnalyticsSubscription(req: Request, res: Response) {
        try {
            const user = req.user;

            const success = await FeeService.processAnalyticsSubscription(user.sub);
            if (success) {
                res.json({ message: 'Analytics subscription purchased successfully' });
            } else {
                res.status(400).json({ error: 'Failed to purchase analytics subscription' });
            }
        } catch (error) {
            Logger.error('Error purchasing analytics subscription:', error);
            res.status(500).json({ error: 'Failed to purchase analytics subscription' });
        }
    }
} 